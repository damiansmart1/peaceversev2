import { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'sw' | 'fr' | 'ar';

export interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const translations = {
  en: {
    // Header
    'hero.title': 'Amani Verse',
    'hero.tagline': 'Youth-Led Peacebuilding for Kenya',
    'hero.description': 'Empowering young voices to build bridges, share stories, and create lasting peace across communities through innovative digital storytelling and safe dialogue spaces.',
    'hero.shareStory': 'Share Your Story',
    'hero.joinCommunity': 'Join Community',
    
    // Features
    'hero.feature1.title': 'Voice-First Stories',
    'hero.feature1.desc': 'Record and share powerful audio narratives that break barriers and build understanding across communities.',
    'hero.feature2.title': 'Community Hubs',
    'hero.feature2.desc': 'Connect with peace champions and safe spaces in your area through our interactive community map.',
    'hero.feature3.title': 'Recognition & Rewards',
    'hero.feature3.desc': 'Earn badges and points for positive contributions that promote peace and unity in your community.',
    
    // Voice Section
    'voice.title': 'Your Voice Matters',
    'voice.description': 'Share your story and be part of positive change in your community and beyond in Kenya',
    
    // Content Section
    'content.title': 'Share Your Story',
    'content.description': 'Upload videos, photos, or audio content to lead and connect with the community',
    
    // Community Feed
    'feed.title': 'Community Stories',
    'feed.description': 'Discover inspiring content shared by community members from Kenya and East Africa',
    
    // Footer
    'footer.tagline': 'Leading youth voices for peace, one story at a time.',
    'footer.features': 'Features',
    'footer.feature1': 'Voice Storytelling',
    'footer.feature2': 'Community Mapping',
    'footer.feature3': 'Peace Challenges',
    'footer.feature4': 'Safe Dialogue Spaces',
    'footer.support': 'Support',
    'footer.support1': 'Accessibility Features',
    'footer.support2': 'Multi-language Support',
    'footer.support3': '24/7 Community Safety',
    'footer.support4': 'Crisis Resources',
    'footer.copyright': '© 2024 Amani Verse. Building bridges, sharing stories, creating peace in Kenya.',
    
    // Challenges Section
    'challenges.title': 'Peace Challenges We Address',
    'challenges.description': 'Our platform specifically tackles the most pressing issues facing Kenyan youth today',
    'challenges.hatespeech.title': 'Hate Speech & Incitement',
    'challenges.hatespeech.desc': 'Combat ethnic tensions and political violence through positive counter-narratives',
    'challenges.misinformation.title': 'Misinformation & Rumors',
    'challenges.misinformation.desc': 'Fight false information that fuels conflict with verified community stories',
    'challenges.marginalization.title': 'Youth Marginalization',
    'challenges.marginalization.desc': 'Amplify voices of young women, PWDs, and minority communities',
    
    // Moderation Section
    'moderation.title': 'AI-Powered Content Safety',
    'moderation.description': 'Advanced detection and prevention systems protect our community',
    'moderation.realtime.title': 'Real-time Detection',
    'moderation.realtime.desc': 'Instantly identifies hate speech, incitement, and harmful content across all languages',
    'moderation.community.title': 'Community Moderation',
    'moderation.community.desc': 'Trained local moderators review flagged content with cultural context',
    'moderation.escalation.title': 'Smart Escalation',
    'moderation.escalation.desc': 'Automatic alerts to authorities for serious threats while protecting user privacy',
    
    // Offline Section
    'offline.title': 'Offline-First Access',
    'offline.description': 'Reaching every youth, regardless of connectivity or device',
    'offline.sms.title': 'SMS Integration',
    'offline.sms.desc': 'Share stories and access resources via simple text messages',
    'offline.ussd.title': 'USSD Support',
    'offline.ussd.desc': 'Feature phone compatibility for maximum accessibility',
    'offline.sync.title': 'Smart Sync',
    'offline.sync.desc': 'Seamlessly syncs content when connection is available',
    
    // Safety Section
    'safety.title': 'Safety & Protection First',
    'safety.description': 'Comprehensive security measures for vulnerable youth peacebuilders',
    'safety.anonymous.title': 'Anonymous Participation',
    'safety.anonymous.desc': 'Share sensitive stories without revealing identity or location',
    'safety.encryption.title': 'End-to-End Encryption',
    'safety.encryption.desc': 'Military-grade security for all communications and content',
    'safety.panic.title': 'Panic Button',
    'safety.panic.desc': 'Instant alerts to trusted contacts and emergency services',
    
    // Trust Section
    'trust.title': 'Building Community Trust',
    'trust.description': 'Partnerships and transparency that build credibility across generations',
    'trust.elders.title': 'Elder Partnerships',
    'trust.elders.desc': 'Collaborations with traditional leaders and community elders',
    'trust.transparency.title': 'Full Transparency',
    'trust.transparency.desc': 'Open processes and clear community guidelines for all activities',
    'trust.verification.title': 'Story Verification',
    'trust.verification.desc': 'Multi-source validation ensures authentic, credible content',
  },
  sw: {
    // Header
    'hero.title': 'Amani Verse',
    'hero.tagline': 'Uongozi wa Vijana katika Kujenga Amani ya Kenya',
    'hero.description': 'Kuongeza nguvu sauti za vijana kujenga madaraja, kushiriki hadithi, na kuunda amani endelevu katika jamii kupitia hadithi za kidijitali na mazingira salama ya mazungumzo.',
    'hero.shareStory': 'Shiriki Hadithi Yako',
    'hero.joinCommunity': 'Jiunge na Jamii',
    
    // Features
    'hero.feature1.title': 'Hadithi za Sauti',
    'hero.feature1.desc': 'Rekodi na shiriki hadithi zenye nguvu za sauti zinazovunja vizuizi na kujenga uelewa katika jamii.',
    'hero.feature2.title': 'Vituo vya Kijamii',
    'hero.feature2.desc': 'Unganisha na mashujaa wa amani na maeneo salama katika eneo lako kupitia ramani yetu ya kijamii.',
    'hero.feature3.title': 'Utambulisho na Tuzo',
    'hero.feature3.desc': 'Pata vibeti na pointi kwa michango chanya inayokuza amani na umoja katika jamii yako.',
    
    // Voice Section
    'voice.title': 'Sauti Yako Ina Maana',
    'voice.description': 'Shiriki hadithi yako na uongeze mabadiliko mazuri katika jamii yako na zaidi huko Kenya',
    
    // Content Section
    'content.title': 'Shiriki Hadithi Yako',
    'content.description': 'Pakia video, picha, au maudhui ya sauti ili kuongoza na kuunganisha na jamii',
    
    // Community Feed
    'feed.title': 'Hadithi za Kijamii',
    'feed.description': 'Gundua maudhui ya kuongoza yaliyoshirikiwa na wanajamii kutoka Kenya na Afrika Mashariki',
    
    // Footer
    'footer.tagline': 'Kuongoza sauti za vijana kwa amani, hadithi moja kwa wakati.',
    'footer.features': 'Vipengele',
    'footer.feature1': 'Hadithi za Sauti',
    'footer.feature2': 'Ramani za Kijamii',
    'footer.feature3': 'Changamoto za Amani',
    'footer.feature4': 'Maeneo Salama ya Mazungumzo',
    'footer.support': 'Msaada',
    'footer.support1': 'Vipengele vya Ufikivu',
    'footer.support2': 'Msaada wa Lugha Nyingi',
    'footer.support3': 'Usalama wa Kijamii 24/7',
    'footer.support4': 'Rasilimali za Msaada wa Haraka',
    'footer.copyright': '© 2024 Amani Verse. Kujenga madaraja, kushiriki hadithi, kuunda amani Kenya.',
  },
  fr: {
    // Header
    'hero.title': 'Amani Verse',
    'hero.tagline': 'Construction de la Paix Dirigée par les Jeunes pour le Kenya',
    'hero.description': 'Donner du pouvoir aux voix jeunes pour construire des ponts, partager des histoires et créer une paix durable à travers les communautés.',
    'hero.shareStory': 'Partagez Votre Histoire',
    'hero.joinCommunity': 'Rejoindre la Communauté',
    
    // Features
    'hero.feature1.title': 'Histoires Vocales',
    'hero.feature1.desc': 'Enregistrez et partagez des récits audio puissants qui brisent les barrières.',
    'hero.feature2.title': 'Centres Communautaires',
    'hero.feature2.desc': 'Connectez-vous avec les champions de la paix dans votre région.',
    'hero.feature3.title': 'Reconnaissance et Récompenses',
    'hero.feature3.desc': 'Gagnez des badges pour vos contributions positives à la paix.',
    
    // Voice Section
    'voice.title': 'Votre Voix Compte',
    'voice.description': 'Partagez votre histoire et participez au changement positif au Kenya',
    
    // Content Section
    'content.title': 'Partagez Votre Histoire',
    'content.description': 'Téléchargez des vidéos, photos ou contenu audio pour diriger et connecter',
    
    // Community Feed
    'feed.title': 'Histoires Communautaires',
    'feed.description': 'Découvrez du contenu inspirant partagé par les membres du Kenya et de l\'Afrique de l\'Est',
    
    // Footer
    'footer.tagline': 'Diriger les voix des jeunes pour la paix, une histoire à la fois.',
    'footer.features': 'Fonctionnalités',
    'footer.feature1': 'Narration Vocale',
    'footer.feature2': 'Cartographie Communautaire',
    'footer.feature3': 'Défis de Paix',
    'footer.feature4': 'Espaces de Dialogue Sûrs',
    'footer.support': 'Support',
    'footer.support1': 'Fonctionnalités d\'Accessibilité',
    'footer.support2': 'Support Multi-langues',
    'footer.support3': 'Sécurité Communautaire 24/7',
    'footer.support4': 'Ressources de Crise',
    'footer.copyright': '© 2024 Amani Verse. Construire des ponts, partager des histoires, créer la paix au Kenya.',
  },
  ar: {
    // Header
    'hero.title': 'أماني فيرس',
    'hero.tagline': 'بناء السلام بقيادة الشباب في كينيا',
    'hero.description': 'تمكين أصوات الشباب لبناء الجسور ومشاركة القصص وخلق سلام دائم عبر المجتمعات.',
    'hero.shareStory': 'شارك قصتك',
    'hero.joinCommunity': 'انضم للمجتمع',
    
    // Features
    'hero.feature1.title': 'قصص صوتية',
    'hero.feature1.desc': 'سجل وشارك الحكايات الصوتية القوية التي تكسر الحواجز.',
    'hero.feature2.title': 'مراكز المجتمع',
    'hero.feature2.desc': 'تواصل مع أبطال السلام في منطقتك.',
    'hero.feature3.title': 'التقدير والمكافآت',
    'hero.feature3.desc': 'احصل على شارات للمساهمات الإيجابية في السلام.',
    
    // Voice Section
    'voice.title': 'صوتك مهم',
    'voice.description': 'شارك قصتك وكن جزءاً من التغيير الإيجابي في كينيا',
    
    // Content Section
    'content.title': 'شارك قصتك',
    'content.description': 'ارفع الفيديوهات والصور أو المحتوى الصوتي للقيادة والتواصل',
    
    // Community Feed
    'feed.title': 'قصص المجتمع',
    'feed.description': 'اكتشف المحتوى الملهم من أعضاء المجتمع في كينيا وشرق أفريقيا',
    
    // Footer
    'footer.tagline': 'قيادة أصوات الشباب للسلام، قصة واحدة في كل مرة.',
    'footer.features': 'الميزات',
    'footer.feature1': 'السرد الصوتي',
    'footer.feature2': 'رسم خرائط المجتمع',
    'footer.feature3': 'تحديات السلام',
    'footer.feature4': 'مساحات الحوار الآمنة',
    'footer.support': 'الدعم',
    'footer.support1': 'ميزات إمكانية الوصول',
    'footer.support2': 'دعم متعدد اللغات',
    'footer.support3': 'أمان المجتمع ٢٤/٧',
    'footer.support4': 'موارد الأزمات',
    'footer.copyright': '© ٢٠٢٤ أماني فيرس. بناء الجسور، مشاركة القصص، خلق السلام في كينيا.',
  }
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};