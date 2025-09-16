import { useState, useEffect, createContext, useContext } from 'react';

export type Language = 'en' | 'sw' | 'fr' | 'ar' | 'so' | 'am';

export interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const translations = {
  en: {
    // Navigation & Common
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.voice': 'Voice Stories',
    'nav.community': 'Community',
    'nav.radio': 'Peace Radio',
    'nav.map': 'Community Map',
    'nav.challenges': 'Challenges',
    'nav.safety': 'Safety & Trust',
    'nav.footer.global': 'Global peace platform',
    'common.loading': 'Loading...',
    'common.error': 'Error occurred',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.close': 'Close',
    
    // Hero Section
    'hero.title': 'Peace Verse',
    'hero.subtitle': 'Empowering Youth Voices for Peace Across Kenya',
    'hero.description': 'Join a transformative community where young peacebuilders share stories, build bridges, and create lasting change through voice-first storytelling and inclusive dialogue.',
    'hero.cta.primary': 'Share Your Story',
    'hero.cta.secondary': 'Explore Community',
    
    // Features Overview
    'features.badge': 'Platform Features',
    'features.title': 'Everything You Need for Peace Building',
    'features.subtitle': 'Discover powerful tools designed to amplify youth voices and foster meaningful connections across communities in Kenya.',
    'features.voice.title': 'Voice-First Stories',
    'features.voice.description': 'Share your experiences through voice recordings that are accessible to everyone, regardless of literacy level.',
    'features.community.title': 'Safe Community Hubs',
    'features.community.description': 'Find and connect with trusted dialogue spaces in your area across Kenya.',
    'features.radio.title': 'Peace Community Radio',
    'features.radio.description': 'Listen to inspiring stories and participate in live discussions about peace and unity.',
    'features.map.title': 'Interactive Community Map',
    'features.map.description': 'Discover peace initiatives, community centers, and safe spaces near you.',
    'features.challenges.title': 'Peace Challenges',
    'features.challenges.description': 'Participate in monthly challenges that promote dialogue, understanding, and positive action.',
    'features.safety.title': 'Safety First',
    'features.safety.description': 'Advanced moderation and safety features ensure a secure environment for all participants.',
    
    // Radio Section
    'radio.badge': 'Peace Radio',
    'radio.title': 'Peace Community Radio',
    'radio.subtitle': 'Connect with peace voices across Kenya through our live radio platform. Share your story, listen to community voices, and join the conversation for positive change.',
    'radio.station.peace': 'Peace Radio',
    'radio.station.peace.desc': 'Youth voices for peace and unity across Kenya',
    'radio.station.community': 'Community Stories FM',
    'radio.station.community.desc': 'Sharing stories that build bridges in communities',
    'radio.station.unity': 'Unity Voices',
    'radio.station.unity.desc': 'Promoting dialogue and understanding',
    'radio.controls.play': 'Play',
    'radio.controls.pause': 'Pause',
    'radio.controls.volume': 'Volume',
    'radio.share.title': 'Share Your Voice',
    'radio.share.description': 'Join the conversation and share your thoughts with the community',
    'radio.share.start': 'Start Broadcasting',
    'radio.share.stop': 'Stop Broadcasting',
    'radio.share.live': 'LIVE',
    'radio.listeners': 'listeners',
    'radio.status.live': 'LIVE',
    'radio.status.offline': 'OFFLINE',
    
    // Accessibility
    'accessibility.title': 'Accessible for Everyone',
    'accessibility.subtitle': 'Our radio platform is designed to reach everyone, including marginalized communities with limited internet access',
    'accessibility.lowBandwidth': 'Low Bandwidth Mode',
    'accessibility.lowBandwidth.desc': 'Optimized for slow internet connections (2G/3G)',
    'accessibility.offline': 'Offline Access',
    'accessibility.offline.desc': 'Download content for offline listening',
    'accessibility.highContrast': 'High Contrast',
    'accessibility.highContrast.desc': 'Enhanced visibility for visual impairments',
    'accessibility.largeText': 'Large Text',
    'accessibility.largeText.desc': 'Increased font size for better readability',
    'accessibility.voicePrompts': 'Voice Prompts',
    'accessibility.voicePrompts.desc': 'Audio navigation assistance',
    'accessibility.autoTranscript': 'Auto Transcription',
    'accessibility.autoTranscript.desc': 'Real-time text of audio content',
    'accessibility.smsUpdates': 'SMS Updates',
    'accessibility.smsUpdates.desc': 'Receive program updates via SMS',
    
    // Voice Recording
    'voice.badge': 'Voice Stories',
    'voice.title': 'Your Voice Matters',
    'voice.subtitle': 'Share your story and drive positive change in your community and beyond in Kenya',
    
    // Content Sharing
    'content.badge': 'Content Sharing',
    'content.share.title': 'Share Your Story',
    'content.share.subtitle': 'Upload videos, photos, or audio content to lead and connect with the community',
    
    // Community Stories
    'community.badge': 'Community Hub',
    'community.stories.title': 'Community Stories',
    'community.stories.subtitle': 'Discover inspiring content shared by community members from Kenya and East Africa',
    
    // Map Section
    'map.badge': 'Community Mapping',
    'map.title': 'Interactive Community Map',
    'map.subtitle': 'Explore peace initiatives, community centers, and safe spaces across Kenya.',
    
    // Challenges Section
    'challenges.badge': 'Peace Challenges',
    'challenges.title': 'Monthly Peace Challenges',
    'challenges.subtitle': 'Participate in activities that promote dialogue, understanding, and positive action in your community.',
    
    // Safety Section
    'safety.badge': 'Safety & Trust',
    'safety.title': 'Safe & Secure Platform',
    'safety.subtitle': 'Advanced moderation and safety features ensure a secure environment for all participants.',
    
    // Peacebuilding Challenges
    'peacebuilding.title': 'Critical Peacebuilding Areas',
    'peacebuilding.subtitle': 'Addressing key challenges to build sustainable peace in Kenya',
    'peacebuilding.hatespeech.title': 'Hate Speech Prevention',
    'peacebuilding.hatespeech.desc': 'AI-powered detection and community reporting of harmful content',
    'peacebuilding.ethnic.title': 'Ethnic Harmony',
    'peacebuilding.ethnic.desc': 'Building bridges across tribal and ethnic divisions',
    'peacebuilding.political.title': 'Political Violence Prevention',
    'peacebuilding.political.desc': 'Early warning systems for political tensions',
    'peacebuilding.cyberbullying.title': 'Digital Safety',
    'peacebuilding.cyberbullying.desc': 'Protecting youth from online harassment and cyberbullying',
    
    // Footer
    'footer.tagline': 'Building bridges, sharing stories, creating peace in Kenya.',
    'footer.features': 'Features',
    'footer.features.voice': 'Voice Storytelling',
    'footer.features.mapping': 'Community Mapping',
    'footer.features.challenges': 'Peace Challenges',
    'footer.features.dialogue': 'Safe Dialogue Spaces',
    'footer.support': 'Support',
    'footer.support.accessibility': 'Accessibility Features',
    'footer.support.multilang': 'Multi-language Support',
    'footer.support.safety': '24/7 Community Safety',
    'footer.support.crisis': 'Crisis Resources',
    
    // Language Selection
    'language.select': 'Select Language',
    'language.current': 'Current Language',
  },
  sw: {
    // Navigation & Common
    'nav.home': 'Nyumbani',
    'nav.about': 'Kuhusu',
    'nav.contact': 'Wasiliana',
    'common.loading': 'Inapakia...',
    'common.error': 'Hitilafu imetokea',
    'common.success': 'Imefanikiwa',
    'common.cancel': 'Ghairi',
    'common.save': 'Hifadhi',
    'common.close': 'Funga',
    
    // Hero Section
    'hero.title': 'Peace Verse',
    'hero.subtitle': 'Kuongeza Nguvu za Sauti za Vijana kwa Amani Kote Kenya',
    'hero.description': 'Jiunge na jamii ya mabadiliko ambapo wajenzi wa amani vijana hushiriki hadithi, kujenga madaraja, na kuunda mabadiliko ya kudumu kupitia hadithi za sauti na mazungumzo ya jumuishi.',
    'hero.cta.primary': 'Shiriki Hadithi Yako',
    'hero.cta.secondary': 'Chunguza Jamii',
    
    // Radio Section
    'radio.title': 'Peace Community Radio',
    'radio.subtitle': 'Unganisha na sauti za amani kote Kenya kupitia jukwaa letu la redio ya moja kwa moja. Shiriki hadithi yako, sikiliza sauti za jamii, na jiunge na mazungumzo ya mabadiliko mazuri.',
    'radio.station.peace': 'Peace Radio',
    'radio.station.peace.desc': 'Sauti za vijana kwa amani na umoja kote Kenya',
    'radio.station.community': 'Hadithi za Jamii FM',
    'radio.station.community.desc': 'Kushiriki hadithi zinazojenga madaraja katika jamii',
    'radio.station.unity': 'Sauti za Umoja',
    'radio.station.unity.desc': 'Kukuza mazungumzo na uelewa',
    'radio.controls.play': 'Cheza',
    'radio.controls.pause': 'Simama',
    'radio.controls.volume': 'Sauti',
    'radio.share.title': 'Shiriki Sauti Yako',
    'radio.share.description': 'Jiunge na mazungumzo na ushiriki mawazo yako na jamii',
    'radio.share.start': 'Anza Kutangaza',
    'radio.share.stop': 'Acha Kutangaza',
    'radio.share.live': 'MOJA KWA MOJA',
    'radio.listeners': 'wasikilizaji',
    'radio.status.live': 'MOJA KWA MOJA',
    'radio.status.offline': 'IMEONDOKA',
    
    // Accessibility
    'accessibility.title': 'Inafikiwa na Kila Mtu',
    'accessibility.subtitle': 'Jukwaa letu la redio limeundwa kufikia kila mtu, ikiwa ni pamoja na jamii zilizo pembezoni zilizo na upatikanaji mdogo wa mtandao',
    'accessibility.lowBandwidth': 'Hali ya Bandwidth Ndogo',
    'accessibility.lowBandwidth.desc': 'Imeboreshwa kwa uhusiano mdogo wa mtandao (2G/3G)',
    'accessibility.offline': 'Ufikiaji wa Nje ya Mtandao',
    'accessibility.offline.desc': 'Pakua maudhui ya kusikiliza nje ya mtandao',
    'accessibility.highContrast': 'Mchanganyiko wa Juu',
    'accessibility.highContrast.desc': 'Uonekani wa kupata kwa matatizo ya kuona',
    'accessibility.largeText': 'Maandishi Makubwa',
    'accessibility.largeText.desc': 'Ukubwa wa kupanda wa herufi kwa usomaji bora',
    'accessibility.voicePrompts': 'Vidokezo vya Sauti',
    'accessibility.voicePrompts.desc': 'Msaada wa urambazaji wa sauti',
    'accessibility.autoTranscript': 'Unakili wa Otomatiki',
    'accessibility.autoTranscript.desc': 'Maandishi ya wakati halisi ya maudhui ya sauti',
    'accessibility.smsUpdates': 'Masasisho ya SMS',
    'accessibility.smsUpdates.desc': 'Pokea masasisho ya programu kupitia SMS',
    
    // Voice Recording
    'voice.title': 'Sauti Yako Ina Maana',
    'voice.subtitle': 'Shiriki hadithi yako na uongeze mabadiliko mazuri katika jamii yako na zaidi huko Kenya',
    
    // Content Sharing
    'content.share.title': 'Shiriki Hadithi Yako',
    'content.share.subtitle': 'Pakia video, picha, au maudhui ya sauti ili kuongoza na kuunganisha na jamii',
    
    // Community Stories
    'community.stories.title': 'Hadithi za Kijamii',
    'community.stories.subtitle': 'Gundua maudhui ya kuongoza yaliyoshirikiwa na wanajamii kutoka Kenya na Afrika Mashariki',
    
    // Peacebuilding Challenges
    'peacebuilding.title': 'Maeneo Muhimu ya Kujenga Amani',
    'peacebuilding.subtitle': 'Kushughulikia changamoto muhimu za kujenga amani endelevu Kenya',
    'peacebuilding.hatespeech.title': 'Kuzuia Hotuba za Chuki',
    'peacebuilding.hatespeech.desc': 'Ugunduzi wa AI na ripoti za jamii za maudhui yenye madhara',
    'peacebuilding.ethnic.title': 'Maelewano ya Kikabila',
    'peacebuilding.ethnic.desc': 'Kujenga madaraja kati ya migawanyiko ya kikabila na kiutamaduni',
    'peacebuilding.political.title': 'Kuzuia Vurugu za Kisiasa',
    'peacebuilding.political.desc': 'Mifumo ya kilele ya kutonya za mvutano wa kisiasa',
    'peacebuilding.cyberbullying.title': 'Usalama wa Kidijitali',
    'peacebuilding.cyberbullying.desc': 'Kulinda vijana kutoka kwa unyanyasaji mtandaoni na kijirani',
    
    // Footer
    'footer.tagline': 'Kujenga madaraja, kushiriki hadithi, kuunda amani Kenya.',
    'footer.features': 'Vipengele',
    'footer.features.voice': 'Hadithi za Sauti',
    'footer.features.mapping': 'Ramani za Kijamii',
    'footer.features.challenges': 'Changamoto za Amani',
    'footer.features.dialogue': 'Maeneo Salama ya Mazungumzo',
    'footer.support': 'Msaada',
    'footer.support.accessibility': 'Vipengele vya Ufikivu',
    'footer.support.multilang': 'Msaada wa Lugha Nyingi',
    'footer.support.safety': 'Usalama wa Kijamii 24/7',
    'footer.support.crisis': 'Rasilimali za Msaada wa Haraka',
    
    // Language Selection
    'language.select': 'Chagua Lugha',
    'language.current': 'Lugha ya Sasa',
  },
  fr: {
    // Navigation & Common
    'nav.home': 'Accueil',
    'nav.about': 'À propos',
    'nav.contact': 'Contact',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur survenue',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.save': 'Sauvegarder',
    'common.close': 'Fermer',
    
    // Hero Section
    'hero.title': 'Peace Verse',
    'hero.subtitle': 'Amplifier les Voix des Jeunes pour la Paix à Travers le Kenya',
    'hero.description': 'Rejoignez une communauté transformatrice où les jeunes artisans de paix partagent des histoires, construisent des ponts et créent un changement durable grâce à la narration vocale et au dialogue inclusif.',
    'hero.cta.primary': 'Partagez Votre Histoire',
    'hero.cta.secondary': 'Explorer la Communauté',
    
    // Radio Section
    'radio.title': 'Radio Communautaire Peace',
    'radio.subtitle': 'Connectez-vous avec les voix de la paix à travers le Kenya grâce à notre plateforme radio en direct. Partagez votre histoire, écoutez les voix communautaires et rejoignez la conversation pour un changement positif.',
    'radio.station.peace': 'Radio de la Paix',
    'radio.station.peace.desc': 'Voix des jeunes pour la paix et l\'unité à travers le Kenya',
    'radio.station.community': 'Histoires Communautaires FM',
    'radio.station.community.desc': 'Partager des histoires qui construisent des ponts dans les communautés',
    'radio.station.unity': 'Voix de l\'Unité',
    'radio.station.unity.desc': 'Promouvoir le dialogue et la compréhension',
    'radio.controls.play': 'Jouer',
    'radio.controls.pause': 'Pause',
    'radio.controls.volume': 'Volume',
    'radio.share.title': 'Partagez Votre Voix',
    'radio.share.description': 'Rejoignez la conversation et partagez vos pensées avec la communauté',
    'radio.share.start': 'Commencer la Diffusion',
    'radio.share.stop': 'Arrêter la Diffusion',
    'radio.share.live': 'EN DIRECT',
    'radio.listeners': 'auditeurs',
    'radio.status.live': 'EN DIRECT',
    'radio.status.offline': 'HORS LIGNE',
    
    // Language Selection
    'language.select': 'Sélectionner la Langue',
    'language.current': 'Langue Actuelle',
  },
  ar: {
    // Navigation & Common
    'nav.home': 'الرئيسية',
    'nav.about': 'حول',
    'nav.contact': 'اتصل',
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ',
    'common.success': 'نجح',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.close': 'إغلاق',
    
    // Hero Section
    'hero.title': 'أماني فيرس',
    'hero.subtitle': 'تمكين أصوات الشباب من أجل السلام عبر كينيا',
    'hero.description': 'انضم إلى مجتمع تحويلي حيث يشارك بناة السلام الشباب القصص، ويبنون الجسور، ويخلقون تغييراً دائماً من خلال السرد الصوتي والحوار الشامل.',
    'hero.cta.primary': 'شارك قصتك',
    'hero.cta.secondary': 'استكشف المجتمع',
    
    // Radio Section
    'radio.title': 'راديو مجتمع أماني',
    'radio.subtitle': 'تواصل مع أصوات السلام عبر كينيا من خلال منصة الراديو المباشرة. شارك قصتك، استمع لأصوات المجتمع، وانضم للمحادثة من أجل التغيير الإيجابي.',
    'radio.station.peace': 'راديو السلام أماني',
    'radio.station.peace.desc': 'أصوات الشباب من أجل السلام والوحدة عبر كينيا',
    'radio.station.community': 'قصص المجتمع إف إم',
    'radio.station.community.desc': 'مشاركة القصص التي تبني الجسور في المجتمعات',
    'radio.station.unity': 'أصوات الوحدة',
    'radio.station.unity.desc': 'تعزيز الحوار والفهم',
    'radio.controls.play': 'تشغيل',
    'radio.controls.pause': 'إيقاف',
    'radio.controls.volume': 'الصوت',
    'radio.share.title': 'شارك صوتك',
    'radio.share.description': 'انضم للمحادثة وشارك أفكارك مع المجتمع',
    'radio.share.start': 'بدء البث',
    'radio.share.stop': 'إيقاف البث',
    'radio.share.live': 'مباشر',
    'radio.listeners': 'مستمعين',
    'radio.status.live': 'مباشر',
    'radio.status.offline': 'غير متصل',
    
    // Language Selection
    'language.select': 'اختر اللغة',
    'language.current': 'اللغة الحالية',
  },
  so: {
    // Navigation & Common
    'nav.home': 'Hoy',
    'nav.about': 'Ku saabsan',
    'nav.contact': 'La xiriir',
    'common.loading': 'Waa la rarayo...',
    'common.error': 'Qalad ayaa dhacday',
    'common.success': 'Guul',
    'common.cancel': 'Jooji',
    'common.save': 'Kaydi',
    'common.close': 'Xir',
    
    // Hero Section
    'hero.title': 'Peace Verse',
    'hero.subtitle': 'Xoojinta Codadka Dhalinyarada Nabadda ee Dalka Kenya',
    'hero.description': 'Ku biir bulsho isbadal ah oo ay dhallinyarada dhisayaasha nabadda wada qaybiyaan sheekooyin, dhisaan buundooyin, oo abuuraan isbadal waara iyagoo u adeegsanaya sheekooyin codka ah iyo wadahadal guud.',
    'hero.cta.primary': 'Wadaag Sheekaadaada',
    'hero.cta.secondary': 'Sahami Bulshada',
    
    // Radio Section
    'radio.title': 'Peace Community Radio',
    'radio.subtitle': 'Ku xirmo codadka nabadda ee Kenya iyada oo loo adeegsado joogtada raadiyaha. Wadaag sheekaadaada, dhagayso codadka bulshada, oo ku biir wada hadalka isbadalka wanaagsan.',
    'radio.station.peace': 'Peace Radio',
    'radio.station.peace.desc': 'Codadka dhalinyarada nabadda iyo midnimada Kenya',
    'radio.station.community': 'Sheekooyin Bulshada FM',
    'radio.station.community.desc': 'Wadaagista sheekooyin dhisa buundooyin bulshada gudaheeda',
    'radio.station.unity': 'Codadka Midnimada',
    'radio.station.unity.desc': 'Kobcinta wada hadal iyo fahamka',
    'radio.controls.play': 'Ciyaar',
    'radio.controls.pause': 'Joogso',
    'radio.controls.volume': 'Codka',
    'radio.share.title': 'Wadaag Codkaaga',
    'radio.share.description': 'Ku biir wada hadalka oo wadaag fikradahaaga bulshada',
    'radio.share.start': 'Bilow Baahinta',
    'radio.share.stop': 'Joogsi Baahinta',
    'radio.share.live': 'TOOS AH',
    'radio.listeners': 'dhagaystayaal',
    'radio.status.live': 'TOOS AH',
    'radio.status.offline': 'OFFLINE',
    
    // Language Selection
    'language.select': 'Dooro Luqadda',
    'language.current': 'Luqadda Hadda',
  },
  am: {
    // Navigation & Common
    'nav.home': 'ቤት',
    'nav.about': 'ስለ እኛ',
    'nav.contact': 'ያገናኙን',
    'common.loading': 'በመጫን ላይ...',
    'common.error': 'ስህተት ተከስቷል',
    'common.success': 'ተሳክቷል',
    'common.cancel': 'ይተዉ',
    'common.save': 'አስቀምጥ',
    'common.close': 'ዝጋ',
    
    // Hero Section
    'hero.title': 'አማኒ ቨርስ',
    'hero.subtitle': 'በኬንያ ውስጥ ለሰላም የወጣት ድምፆችን ማጠናከር',
    'hero.description': 'የወጣት ሰላም ሰሪዎች ታሪኮችን የሚያካፍሉበት፣ ድልድዮችን የሚገነቡበት እና በድምፅ-የመጀመሪያ የታሪክ መረጃ እና አማካሪ ውይይት ዘላቂ ለውጥ የሚፈጥሩበት ተቀያይሪ ማህበረሰብ ይቀላቀሉ።',
    'hero.cta.primary': 'ታሪክዎን ያካፍሉ',
    'hero.cta.secondary': 'ማህበረሰቡን ያስሱ',
    
    // Radio Section
    'radio.title': 'አማኒ ማህበረሰብ ሬዲዮ',
    'radio.subtitle': 'በቀጥታ ሬዲዮ መድረካችን በኩል በኬንያ ውስጥ ካሉ የሰላም ድምፆች ጋር ተገናኙ። ታሪክዎን ያካፍሉ፣ የማህበረሰብ ድምፆችን ያዳምጡ እና ለአዎንታዊ ለውጥ ውይይቱን ይቀላቀሉ።',
    'radio.station.peace': 'አማኒ ሰላም ሬዲዮ',
    'radio.station.peace.desc': 'በኬንያ ውስጥ ለሰላምና አንድነት የወጣቶች ድምፆች',
    'radio.station.community': 'የማህበረሰብ ታሪኮች ኤፍ.ኤም',
    'radio.station.community.desc': 'በማህበረሰቦች ውስጥ ድልድዮችን የሚገነቡ ታሪኮችን መካፈል',
    'radio.station.unity': 'የአንድነት ድምፆች',
    'radio.station.unity.desc': 'ውይይትና መግባባትን ማበረታታት',
    'radio.controls.play': 'ተጫወት',
    'radio.controls.pause': 'ቆም',
    'radio.controls.volume': 'ድምፅ',
    'radio.share.title': 'ድምፅዎን ያካፍሉ',
    'radio.share.description': 'ውይይቱን ይቀላቀሉ እና ሀሳቦችዎን ከማህበረሰቡ ጋር ያካፍሉ',
    'radio.share.start': 'ስርጭትን ይጀምሩ',
    'radio.share.stop': 'ስርጭትን ያቁሙ',
    'radio.share.live': 'በቀጥታ',
    'radio.listeners': 'አድማጮች',
    'radio.status.live': 'በቀጥታ',
    'radio.status.offline': 'ከመስመር ውጭ',
    
    // Language Selection
    'language.select': 'ቋንቋ ይምረጡ',
    'language.current': 'አሁን ያለው ቋንቋ',
  }
};

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') as Language;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('preferred-language', newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return {
    language,
    setLanguage: changeLanguage,
    t,
    availableLanguages: Object.keys(translations) as Language[]
  };
};