// import { GoogleGenAI, Type } from '@google/genai';

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateTitles(domain: string, level: number): Promise<string[]> {
  // Mock data for development
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        `${domain} 的奥秘`,
        `理解 ${domain} 基础`,
        `${domain} 的本质`,
        `高级 ${domain} 概念`,
        `${domain} 的未来`,
        `探索 ${domain} 理论`,
        `日常生活中的 ${domain}`,
        `${domain} 的历史`,
        `${domain} 与科技`,
        `${domain} 中的未解之谜`,
        `${domain} 的哲学`,
        `${domain} 初学者指南`,
        `深入了解 ${domain}`,
        `${domain} 案例研究`,
        `${domain} 的演变`,
        `${domain} 的关键人物`,
        `${domain} 实验`,
        `${domain} 的数学原理`,
        `${domain} 与社会`,
        `${domain} 的伦理`,
        `流行文化中的 ${domain}`,
        `${domain} 的经济学`,
        `${domain} 与环境`,
        `${domain} 的心理学`,
        `21世纪的 ${domain}`,
        `${domain} 的艺术`,
        `${domain} 与创新`,
        `${domain} 的全球影响`,
        `${domain} 的争议`,
        `${domain} 的下一个大事件`
      ]);
    }, 1000);
  });
}

export async function generateArticleData(title: string): Promise<any> {
  // Mock data for development
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        part1: `这是关于“${title}”的文章的第一部分。它介绍了核心概念，并为更深入的理解奠定了基础。我们探讨了使这个主题如此迷人且与现代世界息息相关的基本原理。`,
        prediction1: {
          question: "根据介绍，这个主题的主要焦点是什么？",
          options: ["基本原理", "无关的概念"],
          correctIndex: 0
        },
        part2: `深入探讨“${title}”，我们会遇到更复杂的想法。本节建立在第一部分奠定的基础之上，介绍了高级理论和实际应用。它挑战读者对主题进行批判性思考。`,
        prediction2: {
          question: "本节主要介绍了什么？",
          options: ["基本思想", "高级理论和实际应用"],
          correctIndex: 1
        },
        part3: `总之，“${title}”提供了丰富的探索领域。我们已经看到它的原理如何应用于各种场景，以及它如何不断发展。未来在这个领域还有令人兴奋的发现可能性。`,
        quiz: [
          {
            question: `文章“${title}”的主题是什么？`,
            options: ["核心概念和原理", "一个完全不同的主题", "一个虚构的故事", "一段历史记录"],
            correctIndex: 0
          },
          {
            question: "文章如何描述未来的可能性？",
            options: ["黯淡且有限", "令人兴奋且充满发现", "不确定且令人困惑", "无关紧要"],
            correctIndex: 1
          },
          {
            question: "文章的第二部分挑战读者去做什么？",
            options: ["记住事实", "忽略细节", "批判性思考", "跳到最后"],
            correctIndex: 2
          }
        ]
      });
    }, 1500);
  });
}
