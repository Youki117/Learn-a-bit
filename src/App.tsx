import { useState, useEffect } from 'react';
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
import { View, Topic, TOPICS, ArticleData } from './types';
import { generateArticleData, generateTitles } from './services/ai';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('explore');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [activeDomain, setActiveDomain] = useState<string>('科学');
  const [articleData, setArticleData] = useState<ArticleData | null>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);

  // Loop states
  const [titles, setTitles] = useState<string[]>([]);
  const [currentTitleGroupIndex, setCurrentTitleGroupIndex] = useState(0);
  const [showTitleSelection, setShowTitleSelection] = useState(false);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [activeToast, setActiveToast] = useState<'quiz' | 'feynman' | 'next_article' | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showFeynmanModal, setShowFeynmanModal] = useState(false);
  const [currentArticleTitle, setCurrentArticleTitle] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const startLevel = async () => {
    setIsGeneratingTitles(true);
    setShowTitleSelection(true);
    try {
      const generatedTitles = await generateTitles(activeDomain, 1);
      setTitles(generatedTitles);
      setCurrentTitleGroupIndex(0);
    } catch (e) {
      console.error(e);
      setTitles(Array.from({ length: 30 }, (_, i) => `备选主题 ${i + 1}`));
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const loadArticle = async (title: string) => {
    setCurrentArticleTitle(title);
    setCurrentView('lesson');
    setArticleData(null);
    setIsLoadingArticle(true);
    try {
      const data = await generateArticleData(title);
      setArticleData(data);
    } catch (e) {
      console.error(e);
      // Fallback data if generation fails
      setArticleData({
        part1: "这是备选的第一部分内容。",
        prediction1: { question: "问题1？", options: ["选项 A", "选项 B"], correctIndex: 0 },
        part2: "备选的第二部分内容。",
        prediction2: { question: "问题2？", options: ["选项 A", "选项 B"], correctIndex: 0 },
        part3: "备选的第三部分内容。",
        quiz: [{ question: "测验 1？", options: ["选项 A", "选项 B", "选项 C", "选项 D"], correctIndex: 0 }]
      });
    } finally {
      setIsLoadingArticle(false);
    }
  };

  const handleTitleSelect = (title: string) => {
    setShowTitleSelection(false);
    loadArticle(title);
  };

  const handleNodeSelect = (nodeId: number) => {
    if (nodeId === 1) {
      startLevel();
    }
  };

  const handleToastAction = () => {
    if (activeToast === 'quiz') {
      setActiveToast(null);
      setShowQuizModal(true);
    } else if (activeToast === 'feynman') {
      setActiveToast(null);
      setShowFeynmanModal(true);
    } else if (activeToast === 'next_article') {
      setActiveToast(null);
      const nextIndex = currentTitleGroupIndex + 1;
      if (nextIndex * 3 < titles.length) {
        setCurrentTitleGroupIndex(nextIndex);
        setShowTitleSelection(true);
      } else {
        // Finished all titles, return to map
        setCurrentView('map');
      }
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'explore':
        return (
          <ExploreView 
            activeDomain={activeDomain}
            setActiveDomain={setActiveDomain}
            onStartExploration={() => setCurrentView('map')} 
          />
        );
      case 'map':
        return <MapView activeDomain={activeDomain} onNodeSelect={handleNodeSelect} />;
      case 'lesson':
        return (
          <>
            <LessonView 
              key={currentArticleTitle}
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
                  setShowFeynmanModal(false);
                  setActiveToast('next_article');
                }} 
              />
            )}
            {activeToast && (
              <NotificationToast type={activeToast} onAction={handleToastAction} />
            )}
            {showTitleSelection && (
              <TitleSelectionModal 
                titles={isGeneratingTitles ? ["加载中...", "加载中...", "加载中..."] : titles.slice(currentTitleGroupIndex * 3, currentTitleGroupIndex * 3 + 3)}
                onSelect={handleTitleSelect}
                onClose={() => {
                  setShowTitleSelection(false);
                  setCurrentView('map');
                }}
                onRefresh={() => startLevel()}
              />
            )}
          </>
        );
      case 'review':
        return <ReviewView />;
      case 'profile':
        return <ProfileView isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />;
      default:
        return (
          <ExploreView 
            activeDomain={activeDomain}
            setActiveDomain={setActiveDomain}
            onStartExploration={() => setCurrentView('map')} 
          />
        );
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onViewChange={setCurrentView}
      showBack={currentView === 'lesson'}
      onBack={() => setCurrentView('explore')}
      title={currentView === 'lesson' ? currentArticleTitle : undefined}
    >
      {renderView()}
      {/* Show title selection modal over map view if triggered there */}
      {currentView === 'map' && showTitleSelection && (
        <TitleSelectionModal 
          titles={isGeneratingTitles ? ["加载中...", "加载中...", "加载中..."] : titles.slice(currentTitleGroupIndex * 3, currentTitleGroupIndex * 3 + 3)}
          onSelect={handleTitleSelect}
          onClose={() => {
            setShowTitleSelection(false);
            setCurrentView('map');
          }}
          onRefresh={() => startLevel()}
        />
      )}
    </Layout>
  );
}
