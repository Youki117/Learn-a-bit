import { useEffect, useMemo, useState } from 'react';
import { Layout } from './components/Layout';
import { ExploreView } from './components/ExploreView';
import { MapView } from './components/MapView';
import { LessonView } from './components/LessonView';
import { QuizView } from './components/QuizView';
import { ReviewView } from './components/ReviewView';
import { FeynmanView } from './components/FeynmanView';
import { ProfileView } from './components/ProfileView';
import { TitleSelectionModal } from './components/TitleSelectionModal';
import { NotificationToast } from './components/NotificationToast';
import { type ArticleData, type View, CATEGORIES } from './types';
import { useAuth } from './context/AuthContext';
import { generateArticleData, generateTitles } from './services/ai';
import {
  deleteLearningProgress,
  fetchAllLearningProgress,
  saveLearningProgress,
} from './services/api';
import {
  applyTitleGroupsToProgress,
  completeLevelInProgress,
  createDefaultLearningProgress,
  findLevelState,
  removeProgressFromCollection,
  resolveActiveDomainAfterDelete,
  storeArticleForLevel,
  upsertProgressInCollection,
} from './lib/learning-progress';
import type { LearningProgress } from './types/learning-progress';

export default function App() {
  const { session, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<View>('explore');
  const [activeDomain, setActiveDomain] = useState<string>(CATEGORIES[0] ?? '科学');
  const [exploreDomain, setExploreDomain] = useState<string>(CATEGORIES[0] ?? '科学');
  const [articleData, setArticleData] = useState<ArticleData | null>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [progressCollection, setProgressCollection] = useState<LearningProgress[]>([]);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [activeLevelNumber, setActiveLevelNumber] = useState(1);
  const [showTitleSelection, setShowTitleSelection] = useState(false);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [activeToast, setActiveToast] = useState<'quiz' | 'feynman' | 'next_article' | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showFeynmanModal, setShowFeynmanModal] = useState(false);
  const [currentArticleTitle, setCurrentArticleTitle] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
    }
    return false;
  });

  const currentDomainProgress = useMemo(
    () => progressCollection.find((item) => item.domain === activeDomain) ?? createDefaultLearningProgress(activeDomain),
    [activeDomain, progressCollection],
  );
  const currentLevelState = findLevelState(currentDomainProgress, activeLevelNumber);
  const modalTitles = isGeneratingTitles ? ['加载中...', '加载中...', '加载中...'] : currentLevelState?.titleOptions ?? [];

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const token = session?.access_token;

    if (!token) {
      setProgressCollection([]);
      setProgressError(null);
      return;
    }

    let cancelled = false;
    setIsLoadingProgress(true);

    void fetchAllLearningProgress(token)
      .then((collection) => {
        if (cancelled) {
          return;
        }

        setProgressCollection(collection);
        setProgressError(null);
        if (!collection.length) {
          return;
        }

        if (!collection.some((item) => item.domain === activeDomain)) {
          setActiveDomain(collection[0].domain);
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setProgressCollection([]);
        setProgressError(error instanceof Error ? error.message : 'Failed to load learning progress');
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingProgress(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeDomain, session?.access_token]);

  useEffect(() => {
    setShowTitleSelection(false);
    setCurrentArticleTitle('');
    setArticleData(null);
    setActiveLevelNumber(1);
  }, [activeDomain]);

  useEffect(() => {
    if (!progressCollection.length) {
      return;
    }

    if (!CATEGORIES.includes(exploreDomain)) {
      setExploreDomain(CATEGORIES[0] ?? '科学');
    }
  }, [exploreDomain, progressCollection]);

  const persistProgress = async (nextProgress: LearningProgress) => {
    const token = session?.access_token;
    const optimistic = upsertProgressInCollection(progressCollection, nextProgress);

    if (!token) {
      throw new Error('请先登录，再添加学习领域');
    }

    setProgressCollection(optimistic);

    try {
      const savedProgress = await saveLearningProgress(token, nextProgress);
      const refreshedCollection = await fetchAllLearningProgress(token);
      setProgressCollection(
        refreshedCollection.length ? refreshedCollection : upsertProgressInCollection(optimistic, savedProgress),
      );
      setProgressError(null);
      return savedProgress;
    } catch (error) {
      setProgressCollection(progressCollection);
      const message = error instanceof Error ? error.message : 'Failed to save learning progress';
      setProgressError(message);
      throw new Error(message);
    }
  };

  const ensureDomainStarted = async (domain: string) => {
    const existing = progressCollection.find((item) => item.domain === domain);
    if (existing) {
      setActiveDomain(domain);
      return existing;
    }

    setProgressError(null);
    const defaultProgress = createDefaultLearningProgress(domain);
    const savedProgress = await persistProgress(defaultProgress);
    setActiveDomain(domain);
    return savedProgress;
  };

  const ensureTitleOptionsForLevel = async (level: number, progress: LearningProgress = currentDomainProgress) => {
    setProgressError(null);
    const levelState = findLevelState(progress, level);
    if (levelState?.titleOptions.length) {
      return progress;
    }

    setIsGeneratingTitles(true);
    try {
      const titleGroups = await generateTitles(progress.domain);
      const nextProgress = applyTitleGroupsToProgress(progress, titleGroups);
      return await persistProgress(nextProgress);
    } catch (error) {
      setProgressError(error instanceof Error ? error.message : 'Failed to generate titles');
      throw error;
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const loadArticle = async (domain: string, level: number, title: string) => {
    setProgressError(null);
    setActiveDomain(domain);
    setActiveLevelNumber(level);
    setCurrentArticleTitle(title);
    setCurrentView('lesson');
    setArticleData(null);
    setIsLoadingArticle(true);

    const progress = progressCollection.find((item) => item.domain === domain) ?? createDefaultLearningProgress(domain);
    const savedLevel = findLevelState(progress, level);
    if (savedLevel?.selectedTitle === title && savedLevel.articleData) {
      setArticleData(savedLevel.articleData);
      setIsLoadingArticle(false);
      return;
    }

    try {
      const data = await generateArticleData(domain, title);
      setArticleData(data);
      const nextProgress = storeArticleForLevel(progress, level, title, data);
      await persistProgress(nextProgress);
    } catch (error) {
      setProgressError(error instanceof Error ? error.message : 'Failed to generate article');
      setCurrentView('map');
      setShowTitleSelection(true);
    } finally {
      setIsLoadingArticle(false);
    }
  };

  const openLevel = async (domain: string, level: number) => {
    setProgressError(null);
    const progress = progressCollection.find((item) => item.domain === domain) ?? createDefaultLearningProgress(domain);
    const isUnlocked = level <= progress.currentLevel || progress.currentLevel > progress.totalLevels;
    if (!isUnlocked || level > progress.totalLevels) {
      return;
    }

    setActiveDomain(domain);
    setActiveLevelNumber(level);
    const levelState = findLevelState(progress, level);

    if (levelState?.selectedTitle && levelState.articleData) {
      setCurrentArticleTitle(levelState.selectedTitle);
      setArticleData(levelState.articleData);
      setShowTitleSelection(false);
      setCurrentView('lesson');
      return;
    }

    if (levelState?.titleOptions.length) {
      setCurrentView('map');
      setShowTitleSelection(true);
      return;
    }

    try {
      const nextProgress = await ensureTitleOptionsForLevel(level, progress);
      if (findLevelState(nextProgress, level)?.titleOptions.length) {
        setCurrentView('map');
        setShowTitleSelection(true);
      }
    } catch {
      setShowTitleSelection(false);
    }
  };

  const handleTitleSelect = (title: string) => {
    setShowTitleSelection(false);
    void loadArticle(activeDomain, activeLevelNumber, title);
  };

  const handleNodeSelect = (domain: string, level: number) => {
    void openLevel(domain, level);
  };

  const handleDeleteDomain = async (domain: string) => {
    if (!session?.access_token) {
      return;
    }

    if (!window.confirm(`删除领域「${domain}」后，该领域的关卡进度会一起移除。确定继续吗？`)) {
      return;
    }

    try {
      await deleteLearningProgress(session.access_token, domain);
      const nextCollection = removeProgressFromCollection(progressCollection, domain);
      const nextActiveDomain = resolveActiveDomainAfterDelete(progressCollection, domain, activeDomain);

      setProgressCollection(nextCollection);
      setProgressError(null);

      if (nextActiveDomain) {
        setActiveDomain(nextActiveDomain);
      } else {
        setCurrentView('explore');
        setActiveDomain(CATEGORIES[0] ?? '科学');
      }
    } catch (error) {
      setProgressError(error instanceof Error ? error.message : 'Failed to delete domain');
    }
  };

  const handleFeynmanComplete = async () => {
    setShowFeynmanModal(false);
    const nextProgress = completeLevelInProgress(currentDomainProgress, activeLevelNumber);
    await persistProgress(nextProgress);
    setActiveToast('next_article');
  };

  const handleToastAction = async () => {
    if (activeToast === 'quiz') {
      setActiveToast(null);
      setShowQuizModal(true);
    } else if (activeToast === 'feynman') {
      setActiveToast(null);
      setShowFeynmanModal(true);
    } else if (activeToast === 'next_article') {
      setActiveToast(null);
      if (currentDomainProgress.currentLevel <= currentDomainProgress.totalLevels) {
        const nextLevel = currentDomainProgress.currentLevel;
        setActiveLevelNumber(nextLevel);
        await openLevel(activeDomain, nextLevel);
      } else {
        setCurrentView('map');
      }
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'explore':
        return (
          <ExploreView
            activeDomain={exploreDomain}
            setActiveDomain={setExploreDomain}
            error={progressError}
            onStartExploration={() => {
              void ensureDomainStarted(exploreDomain)
                .then(() => {
                  setCurrentView('map');
                })
                .catch(() => {
                  setCurrentView('explore');
                });
            }}
          />
        );
      case 'map':
        return (
          <MapView
            progressCollection={progressCollection}
            activeDomain={activeDomain}
            onDomainChange={setActiveDomain}
            onNodeSelect={handleNodeSelect}
            onAddDomain={() => setCurrentView('explore')}
            onDeleteDomain={(domain) => {
              void handleDeleteDomain(domain);
            }}
            loading={isLoadingProgress}
            error={progressError}
          />
        );
      case 'lesson':
        return (
          <>
            <LessonView
              key={`${activeDomain}-${activeLevelNumber}-${currentArticleTitle}`}
              title={currentArticleTitle}
              data={articleData}
              isLoading={isLoadingArticle}
              onComplete={() => setActiveToast('quiz')}
            />
            {showQuizModal && (
              <QuizView
                data={articleData?.quiz || []}
                onComplete={() => {
                  setShowQuizModal(false);
                  setActiveToast('feynman');
                }}
              />
            )}
            {showFeynmanModal && (
              <FeynmanView
                title={currentArticleTitle}
                onComplete={() => {
                  void handleFeynmanComplete();
                }}
              />
            )}
            {activeToast && <NotificationToast type={activeToast} onAction={() => void handleToastAction()} />}
          </>
        );
      case 'review':
        return <ReviewView />;
      case 'profile':
        return <ProfileView isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />;
      default:
        return (
          <ExploreView
            activeDomain={exploreDomain}
            setActiveDomain={setExploreDomain}
            error={progressError}
            onStartExploration={() => {
              void ensureDomainStarted(exploreDomain)
                .then(() => {
                  setCurrentView('map');
                })
                .catch(() => {
                  setCurrentView('explore');
                });
            }}
          />
        );
    }
  };

  return (
    <Layout
      currentView={currentView}
      onViewChange={setCurrentView}
      showBack={currentView === 'lesson'}
      onBack={() => setCurrentView('map')}
      title={currentView === 'lesson' ? currentArticleTitle : undefined}
    >
      {renderView()}
      {currentView === 'map' && showTitleSelection && (
        <TitleSelectionModal
          titles={modalTitles}
          onSelect={handleTitleSelect}
          onClose={() => {
            setShowTitleSelection(false);
            setCurrentView('map');
          }}
          onRefresh={() => {
            void ensureTitleOptionsForLevel(activeLevelNumber);
          }}
        />
      )}
    </Layout>
  );
}
