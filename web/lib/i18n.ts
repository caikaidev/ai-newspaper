import { cookies, headers } from 'next/headers'
import type { ScoredItem } from '@/lib/types'

export type AppLang = 'en' | 'zh-CN'

export const LANG_COOKIE = 'ai_newspaper_lang'

export function normalizeLang(input?: string | null): AppLang | null {
  if (!input) return null
  const lower = input.toLowerCase()
  if (lower.startsWith('zh')) return 'zh-CN'
  if (lower.startsWith('en')) return 'en'
  return null
}

export function detectLangFromAcceptLanguage(input?: string | null): AppLang {
  const lower = (input ?? '').toLowerCase()
  return lower.includes('zh') ? 'zh-CN' : 'en'
}

export function getRequestLang(): AppLang {
  const cookieLang = normalizeLang(cookies().get(LANG_COOKIE)?.value)
  if (cookieLang) return cookieLang
  const headerLang = headers().get('accept-language')
  return detectLangFromAcceptLanguage(headerLang)
}

export function localeForLang(lang: AppLang): string {
  return lang === 'zh-CN' ? 'zh-CN' : 'en-US'
}

export function localizedHeadline(item: ScoredItem, lang: AppLang): string {
  if (lang === 'zh-CN') return item.retro_headline_zh ?? item.retro_headline ?? item.title
  return item.retro_headline ?? item.title
}

export function localizedSummary(item: ScoredItem, lang: AppLang): string {
  if (lang === 'zh-CN') return item.retro_summary_zh ?? item.retro_summary ?? item.summary ?? ''
  return item.retro_summary ?? item.summary ?? ''
}

export const messages = {
  en: {
    siteName: 'The Daily Byte',
    siteDescription: 'Daily AI-curated tech headlines in 1920s journalistic prose',
    newspaperAria: 'The Daily Byte newspaper',
    setupRequiredAria: 'The Daily Byte — Setup Required',
    skipToMain: 'Skip to main content',
    curatedMeta: 'Curated by Artificial Intelligence · Printed in the Manner of 1920',
    volumeLabel: 'Vol. I, No.',
    editionNavigation: 'Edition navigation',
    previousEdition: 'Previous edition',
    nextEdition: 'Next edition',
    latestEdition: 'Latest edition',
    today: 'Today',
    thisEdition: 'This Edition',
    dispatchesFromHN: 'dispatches from Hacker News',
    reportsFromReddit: 'reports from Reddit',
    projectsFromGitHub: 'projects from GitHub',
    skillsTracked: 'skills tracked in today\'s radar',
    aiScoredNote: 'Scored and rewritten by artificial intelligence in the manner of 1920s inter-war correspondence.',
    hackerNews: 'Hacker News',
    reddit: 'Reddit',
    githubTrending: 'GitHub Trending',
    topStories: 'Top Stories',
    notable: 'Notable',
    furtherReading: 'Further Reading',
    programming: 'Programming',
    machineLearning: 'Machine Learning',
    webAndDevops: 'Web & DevOps',
    risingProjects: 'Rising Projects',
    newArrivals: 'New Arrivals',
    furtherNotice: 'Further Notice',
    noDispatches: 'No dispatches received this day.',
    lastEditionPublished: 'Last edition published',
    daysAgoSuffix: 'ago — pipeline may need attention.',
    publishedDailyAt: 'Published daily at 07:00 UTC',
    rssFeed: 'RSS Feed',
    openSource: 'Open Source',
    footerDisclaimer: 'All headlines composed by artificial intelligence in the manner of 1920s inter-war correspondence. No editors were harmed.',
    inauguralPending: 'Vol. I, No. 0 — Inaugural Edition Pending',
    firstEditionNotPublished: 'Your First Edition Has Not Yet Been Published',
    onboardingBody1: 'The presses stand ready, the ink freshly mixed, and the correspondents await their dispatches. To publish your inaugural edition, run the following command from your terminal:',
    onboardingBody2: 'Ensure ANTHROPIC_API_KEY is set in your environment, or that openclaw is running with an active session.',
    onboardingBody3: 'The paper shall arrive fresh each morning at 07:00 UTC.',
    language: 'Language',
    english: 'English',
    simplifiedChinese: '简体中文',
    points: 'pts',
    comments: 'comments',
    installs: 'installs',
    rank: 'rank',
    skillsPage: 'Skills',
    skillsArchivePage: 'Skills Archive',
    archivePage: 'Archive',
    skillsTopicPage: 'Skills Topic Hub',
    notFound: 'Not Found',
    skillsHubIntro: 'A standing desk for the paper\'s AI Skills Radar: each day\'s most notable skills, installation leaders, and editorial watchlist gathered in one place.',
    latestRadar: 'Latest Radar',
    recentSkillEditions: 'Recent Skill Editions',
    viewFullEdition: 'View full edition',
    latestSkillsArchiveNote: 'Browse recent radar editions or return to the matching full newspaper for the wider day in AI and tech.',
    archiveIntro: 'The archive gathers past editions of The Daily Byte, pairing each day\'s main newspaper with its matching AI Skills Radar for easier browsing and discovery.',
    skillsArchiveIntro: 'A dedicated historical index for AI Skills Radar editions, separate from the main newspaper archive.',
    mainEdition: 'Main Edition',
    skillRadarEdition: 'Skills Radar',
    browseLatestEdition: 'Browse latest edition',
    skillsTopicIntro: 'This topic hub gathers the most recent AI skills covered by The Daily Byte, pointing readers toward daily radar editions, historical archives, and the full newspaper context around each wave of tooling.',
    recentSkillsPicks: 'Recent Skills Picks',
    exploreSkillRadar: 'Explore Skills Radar',
    browseSkillArchive: 'Browse skills archive',
    topicHubNote: 'Use this page as the thematic doorway into the project\'s AI skills coverage.',
    relatedPaths: 'Related Paths',
    latestSkillsHub: 'Latest skills hub',
    archiveAndTopicsNote: 'From here you can continue into the radar hub, the topic hub, or the full archive.',
    weeklyRoundup: 'Weekly Roundup',
    weeklyIntro: 'A weekly digest of repeated winners from the daily paper, deduplicated so each story appears once while still showing how many times it surfaced across the week.',
    appearedTimes: 'appeared this week',
    weekIncludes: 'Week includes',
    weeklyHighlights: 'Weekly Highlights',
    seoSecondarySkills: 'Browse current AI skills rankings, recurring radar themes, and links into the broader newspaper coverage.',
    seoSecondarySkillsArchive: 'Use this archive to browse historical AI skills radar editions by date and jump back to each matching full edition.',
    seoSecondaryTopic: 'This topic page highlights recent AI skills picks and connects them to dated radar pages, archives, and full daily editions.',
    seoSecondaryWeekly: 'Weekly roundups surface repeated winners across the daily paper while removing duplicate story cards from the page.',
    seoSecondaryArchive: 'The main archive links each date to both the full newspaper edition and its matching AI skills radar page.'
  },
  'zh-CN': {
    siteName: '每日字节报',
    siteDescription: '以 1920 年代报刊风格呈现的 AI 精选科技头条',
    newspaperAria: '每日字节报',
    setupRequiredAria: '每日字节报 — 等待初始化',
    skipToMain: '跳到主要内容',
    curatedMeta: '由人工智能编选 · 以 1920 年代报刊风格排印',
    volumeLabel: '第 I 卷，第',
    editionNavigation: '期刊导航',
    previousEdition: '上一期',
    nextEdition: '下一期',
    latestEdition: '最新一期',
    today: '今日',
    thisEdition: '本期概览',
    dispatchesFromHN: '条 Hacker News 快讯',
    reportsFromReddit: '条 Reddit 话题',
    projectsFromGitHub: '个 GitHub 项目',
    skillsTracked: '个今日技能雷达条目',
    aiScoredNote: '由人工智能以 1920 年代战间期通讯文风评分并改写。',
    hackerNews: 'Hacker News',
    reddit: 'Reddit',
    githubTrending: 'GitHub 热门趋势',
    topStories: '头条要闻',
    notable: '重点观察',
    furtherReading: '延伸阅读',
    programming: '编程',
    machineLearning: '机器学习',
    webAndDevops: 'Web 与 DevOps',
    risingProjects: '上升项目',
    newArrivals: '新晋项目',
    furtherNotice: '更多关注',
    noDispatches: '今日暂无相关快讯。',
    lastEditionPublished: '距离上次发布已过',
    daysAgoSuffix: '，流水线可能需要检查。',
    publishedDailyAt: '每日 07:00 UTC 发布',
    rssFeed: 'RSS 订阅',
    openSource: '开源仓库',
    footerDisclaimer: '所有标题均由人工智能以 1920 年代战间期通讯风格撰写。没有编辑在此过程中受到伤害。',
    inauguralPending: '第 I 卷，第 0 期 — 创刊号待发布',
    firstEditionNotPublished: '你的第一期报纸尚未刊行',
    onboardingBody1: '印刷机已就位，油墨已调匀，通讯员正等候来稿。若要发布创刊号，请在终端中执行以下命令：',
    onboardingBody2: '请确保环境中已设置 ANTHROPIC_API_KEY，或者 openclaw 正在运行且已建立活动会话。',
    onboardingBody3: '报纸将于每天 UTC 07:00 准时更新。',
    language: '语言',
    english: 'English',
    simplifiedChinese: '简体中文',
    points: '分',
    comments: '评论',
    installs: '安装量',
    rank: '排名',
    skillsPage: '技能页',
    skillsArchivePage: '技能归档',
    archivePage: '归档',
    skillsTopicPage: '技能主题页',
    notFound: '未找到',
    skillsHubIntro: '这里汇集本报 AI Skills Radar 的每日重点：安装量领先者、编辑观察名单，以及值得持续追踪的新技能。',
    latestRadar: '最新雷达',
    recentSkillEditions: '近期技能版',
    viewFullEdition: '查看完整日报',
    latestSkillsArchiveNote: '你可以浏览近期技能雷达，也可以回到对应日期的完整日报，查看当天更广泛的 AI 与科技动态。',
    archiveIntro: '这里收录《每日字节报》的往期内容，将每日主版与对应的 AI Skills Radar 并列，便于浏览与检索。',
    skillsArchiveIntro: '这里是独立的 AI Skills Radar 历史索引页，与主日报总归档分开。',
    mainEdition: '主版日报',
    skillRadarEdition: '技能雷达',
    browseLatestEdition: '查看最新一期',
    skillsTopicIntro: '这个主题页汇总《每日字节报》近期覆盖的 AI skills 内容，引导读者进入每日雷达、历史归档，以及每波工具趋势背后的完整日报上下文。',
    recentSkillsPicks: '近期技能精选',
    exploreSkillRadar: '查看技能雷达',
    browseSkillArchive: '浏览技能归档',
    topicHubNote: '你可以把这里当作进入本项目 AI skills 内容的主题入口。',
    relatedPaths: '相关路径',
    latestSkillsHub: '最新技能主页',
    archiveAndTopicsNote: '你可以从这里继续进入技能雷达主页、主题页，或完整归档。',
    weeklyRoundup: '周报聚合',
    weeklyIntro: '这里汇总本周日报中反复上榜的内容：同一条内容只展示一次，但会保留它在本周出现了几次。',
    appearedTimes: '次上榜',
    weekIncludes: '本周包含',
    weeklyHighlights: '本周精选',
    seoSecondarySkills: '这里可以浏览当前 AI skills 排名、近期雷达主题，以及通往完整日报内容的入口。',
    seoSecondarySkillsArchive: '这个归档页按日期汇总历史 AI Skills Radar 版本，并可跳回对应的完整日报。',
    seoSecondaryTopic: '这个主题页汇总近期 AI skills 精选内容，并连接到按日雷达、历史归档和完整日报。',
    seoSecondaryWeekly: '周聚合页会汇总日报里反复上榜的内容，同时移除页面中的重复故事卡片。',
    seoSecondaryArchive: '总站归档页会把每个日期的完整日报与对应技能雷达并列展示，便于检索与回看。'
  }
} as const

export function t(lang: AppLang) {
  return messages[lang]
}
