import { shopConfig } from '../config'

export type Language = 'fr' | 'ar'
export type ServiceId = 'screen' | 'battery' | 'charging' | 'cooling' | 'software' | 'data'

export interface ServiceContent {
  id: ServiceId
  number: string
  title: string
  short: string
  description: string
  detail: string
}

interface SiteContent {
  nav: { inside: string; process: string; contact: string }
  location: string
  whatsapp: string
  eyebrow: string
  heroLines: string[]
  heroDescription: string
  diagnostic: string
  discover: string
  heroMeta: string
  sceneLabel: string
  sceneHint: string
  insideEyebrow: string
  insideTitle: string
  insideDescription: string
  assemblyLabel: string
  explodedLabel: string
  services: ServiceContent[]
  processEyebrow: string
  processTitle: string
  processIntro: string
  steps: { number: string; title: string; description: string }[]
  requestEyebrow: string
  requestTitle: string
  requestIntro: string
  name: string
  device: string
  model: string
  problem: string
  namePlaceholder: string
  modelPlaceholder: string
  problemPlaceholder: string
  devicePlaceholder: string
  deviceOptions: { value: string; label: string }[]
  send: string
  formNote: string
  formErrors: { name: string; device: string; model: string; problem: string; whatsapp: string }
  contactEyebrow: string
  contactTitle: string
  addressLabel: string
  hoursLabel: string
  phoneLabel: string
  whatsappLabel: string
  contactNote: string
  footerTag: string
  backTop: string
  serviceSelectLabel: string
  fallbackTitle: string
  fallbackDescription: string
  loadingLabel: string
  close: string
  menu: string
  heroDevices: string
  scrollLabel: string
  sceneInteractive: string
  sceneView: string
  preciseTag: string
  demoNotice: string
  fieldsRequired: string
  requestHint: string
  navigationLabel: string
  languageLabel: string
  skipLink: string
  phoneAction: string
}

export const content: Record<Language, SiteContent> = {
  fr: {
    nav: { inside: 'À l’intérieur', process: 'Notre méthode', contact: 'L’atelier' },
    location: shopConfig.location.fr,
    whatsapp: 'Parlons sur WhatsApp',
    eyebrow: `ATELIER DE RÉPARATION · ${shopConfig.location.fr.toUpperCase()}`,
    heroLines: ['ON RÉPARE', 'VOS APPAREILS', 'DE L’INTÉRIEUR.'],
    heroDescription: 'Un écran brisé. Un ordinateur qui chauffe. Une batterie à bout de souffle. Tout commence par comprendre ce qui se passe à l’intérieur.',
    diagnostic: 'Demander un diagnostic',
    discover: 'Explorer l’intérieur',
    heroMeta: 'Téléphones · Ordinateurs · Tablettes',
    sceneLabel: 'VUE DE L’ATELIER / 01',
    sceneHint: 'Faites défiler pour ouvrir les appareils',
    insideEyebrow: 'CHAQUE PIÈCE A SON RÔLE',
    insideTitle: 'Sous la surface,\ntout se joue.',
    insideDescription: 'Explorez les composants. Sélectionnez une pièce pour découvrir l’intervention qui lui correspond.',
    assemblyLabel: 'Assemblé',
    explodedLabel: 'Vue éclatée',
    services: [
      {
        id: 'screen', number: '01', title: 'Écran & affichage', short: 'Retrouver une image nette.',
        description: 'Vitre fissurée, affichage défectueux ou tactile qui ne répond plus : le diagnostic permet d’identifier la pièce à remplacer.',
        detail: 'Écran · Dalle · Tactile',
      },
      {
        id: 'battery', number: '02', title: 'Batterie & autonomie', short: 'Redonner de l’énergie.',
        description: 'Une autonomie qui chute ou des arrêts imprévus méritent un contrôle de la batterie et de son circuit avant tout remplacement.',
        detail: 'Batterie · Alimentation',
      },
      {
        id: 'charging', number: '03', title: 'Connectique & charge', short: 'Rétablir la connexion.',
        description: 'Charge intermittente, port endommagé ou câble mal reconnu : inspection du connecteur et recherche de la cause de la panne.',
        detail: 'Port de charge · Connecteurs',
      },
      {
        id: 'cooling', number: '04', title: 'Refroidissement', short: 'Faire baisser la température.',
        description: 'Ventilation bruyante et surchauffe : nettoyage du système de refroidissement et contrôle des ventilateurs et de la pâte thermique.',
        detail: 'Ventilateurs · Dissipation',
      },
      {
        id: 'software', number: '05', title: 'Système & logiciels', short: 'Retrouver le bon rythme.',
        description: 'Démarrage difficile, lenteurs ou erreurs : recherche des causes logicielles et proposition d’une intervention adaptée à votre usage.',
        detail: 'Système · Pilotes · Logiciels',
      },
      {
        id: 'data', number: '06', title: 'Récupération de données', short: 'Explorer les possibilités.',
        description: 'Des fichiers devenus inaccessibles ? Nous évaluons l’état du support et les possibilités de récupération. Le résultat dépend de la panne.',
        detail: 'Stockage · Fichiers · Diagnostic',
      },
    ],
    processEyebrow: 'UNE MÉTHODE CLAIRE',
    processTitle: 'Comprendre.\nPuis réparer.',
    processIntro: 'Une panne soulève déjà assez de questions. Voici comment se déroule une intervention à l’atelier.',
    steps: [
      { number: '01', title: 'Le diagnostic', description: 'Vous nous décrivez les symptômes. Nous examinons l’appareil pour identifier le problème.' },
      { number: '02', title: 'Le devis', description: 'L’intervention, son prix et le délai estimé vous sont expliqués avant toute décision.' },
      { number: '03', title: 'Votre accord', description: 'La réparation commence après votre accord sur le devis proposé.' },
      { number: '04', title: 'Les retrouvailles', description: 'Nous vérifions l’appareil avec vous et vous informons lorsqu’il est prêt à être récupéré.' },
    ],
    requestEyebrow: 'PARLONS DE VOTRE APPAREIL',
    requestTitle: 'Ça commence\npar un message.',
    requestIntro: 'Quelques détails suffisent pour engager la conversation. Votre demande s’ouvrira dans WhatsApp, prête à être envoyée.',
    name: 'Votre nom', device: 'Type d’appareil', model: 'Marque & modèle', problem: 'Que se passe-t-il ?',
    namePlaceholder: 'Votre prénom et nom',
    modelPlaceholder: 'Ex. : ordinateur portable, modèle 2022',
    problemPlaceholder: 'Décrivez les symptômes et depuis quand ils apparaissent…',
    devicePlaceholder: 'Choisir un appareil',
    deviceOptions: [
      { value: 'phone', label: 'Téléphone' }, { value: 'laptop', label: 'Ordinateur portable' },
      { value: 'desktop', label: 'Ordinateur de bureau' }, { value: 'tablet', label: 'Tablette' },
      { value: 'other', label: 'Autre appareil' },
    ],
    send: 'Continuer sur WhatsApp',
    formNote: 'Ce formulaire prépare un message WhatsApp. Aucune demande n’est enregistrée sur un serveur ; vous choisissez de l’envoyer dans WhatsApp.',
    formErrors: {
      name: 'Indiquez un nom de 2 à 80 caractères.',
      device: 'Sélectionnez votre type d’appareil.',
      model: 'Indiquez la marque et le modèle (2 à 100 caractères).',
      problem: 'Décrivez le problème en 10 à 1 500 caractères.',
      whatsapp: 'Le numéro WhatsApp de l’atelier doit être configuré avant de pouvoir ouvrir la conversation.',
    },
    contactEyebrow: 'RENDEZ-VOUS À L’ATELIER',
    contactTitle: `Au cœur\nde ${shopConfig.location.fr}.`,
    addressLabel: 'Adresse', hoursLabel: 'Horaires', phoneLabel: 'Téléphone', whatsappLabel: 'WhatsApp',
    contactNote: 'Site de démonstration. Les coordonnées de l’atelier sont à renseigner avant publication.',
    footerTag: 'L’attention est dans les détails.',
    backTop: 'Retour en haut', serviceSelectLabel: 'Choisir un composant',
    fallbackTitle: 'À l’intérieur de vos appareils.',
    fallbackDescription: 'Explorez les services ci-dessous. Le diagnostic et la demande de réparation restent accessibles sans la vue 3D.',
    loadingLabel: 'Préparation de l’atelier…', close: 'Fermer', menu: 'Ouvrir le menu',
    heroDevices: 'ORDINATEURS & TÉLÉPHONES',
    scrollLabel: 'DÉFILER POUR EXPLORER',
    sceneInteractive: 'VUE 3D INTERACTIVE',
    sceneView: 'L’ATELIER, DE L’INTÉRIEUR',
    preciseTag: 'Un diagnostic. Un devis. Votre décision.',
    demoNotice: 'Les coordonnées de cet atelier de démonstration sont à renseigner.',
    fieldsRequired: 'Tous les champs sont requis.',
    requestHint: 'Votre message s’ouvrira dans WhatsApp. Vous pourrez le relire avant de l’envoyer.',
    navigationLabel: 'Navigation principale',
    languageLabel: 'Choisir la langue',
    skipLink: 'Aller au contenu',
    phoneAction: 'Appeler l’atelier',
  },
  ar: {
    nav: { inside: 'داخل الأجهزة', process: 'خطوات الإصلاح', contact: 'الورشة' },
    location: shopConfig.location.ar,
    whatsapp: 'تواصل معنا عبر واتساب',
    eyebrow: 'ورشة إصلاح · حواسيب وهواتف',
    heroLines: ['نُصلح', 'أجهزتكم', 'من الداخل.'],
    heroDescription: 'شاشة مكسورة، حاسوب ترتفع حرارته، أو بطارية تنفد سريعًا. البداية هي فهم ما يحدث داخل الجهاز.',
    diagnostic: 'اطلب تشخيصًا',
    discover: 'استكشف الداخل',
    heroMeta: 'هواتف · حواسيب · أجهزة لوحية',
    sceneLabel: 'مشهد الورشة / 01',
    sceneHint: 'مرّر الصفحة لاستكشاف مكوّنات الأجهزة',
    insideEyebrow: 'لكل قطعة دورها',
    insideTitle: 'تحت السطح،\nتتّضح التفاصيل.',
    insideDescription: 'استكشف المكوّنات. اختر قطعة للتعرّف على خدمة الإصلاح المرتبطة بها.',
    assemblyLabel: 'الجهاز مُجمّع',
    explodedLabel: 'المكوّنات منفصلة',
    services: [
      {
        id: 'screen', number: '01', title: 'الشاشة والعرض', short: 'صورة واضحة من جديد.',
        description: 'زجاج متشقق، خلل في العرض، أو شاشة لمس لا تستجيب: يساعد التشخيص على تحديد القطعة التي تحتاج إلى الاستبدال.',
        detail: 'الشاشة · لوحة العرض · اللمس',
      },
      {
        id: 'battery', number: '02', title: 'البطارية والطاقة', short: 'طاقة تواكب يومك.',
        description: 'إذا كانت البطارية تنفد سريعًا أو الجهاز يتوقف فجأة، نفحص البطارية ودائرة التغذية قبل اقتراح الاستبدال.',
        detail: 'البطارية · التغذية الكهربائية',
      },
      {
        id: 'charging', number: '03', title: 'التوصيلات والشحن', short: 'استعادة الاتصال.',
        description: 'شحن متقطع، منفذ تالف، أو كابل لا يتعرّف عليه الجهاز: نفحص الموصل ونبحث عن سبب العطل.',
        detail: 'منفذ الشحن · الموصلات',
      },
      {
        id: 'cooling', number: '04', title: 'التبريد', short: 'حرارة أقل وأداء أهدأ.',
        description: 'ضجيج المراوح أو ارتفاع الحرارة: تنظيف نظام التبريد وفحص المراوح والمعجون الحراري.',
        detail: 'المراوح · تبديد الحرارة',
      },
      {
        id: 'software', number: '05', title: 'النظام والبرامج', short: 'استعادة سلاسة الاستخدام.',
        description: 'صعوبة التشغيل، بطء الجهاز، أو رسائل الخطأ: نبحث عن الأسباب البرمجية ونقترح تدخّلًا يناسب استخدامك.',
        detail: 'النظام · برامج التشغيل · التطبيقات',
      },
      {
        id: 'data', number: '06', title: 'استعادة البيانات', short: 'تقييم فرص الاستعادة.',
        description: 'ملفات لم تعد متاحة؟ نفحص حالة وحدة التخزين وإمكانات الاستعادة. تعتمد النتيجة على طبيعة العطل.',
        detail: 'التخزين · الملفات · التشخيص',
      },
    ],
    processEyebrow: 'خطوات واضحة',
    processTitle: 'نفهم العطل.\nثم نُصلح.',
    processIntro: 'العطل يثير أسئلة كثيرة. إليك كيف تسير عملية الإصلاح في الورشة.',
    steps: [
      { number: '01', title: 'التشخيص', description: 'تصف لنا الأعراض، ثم نفحص الجهاز لتحديد المشكلة.' },
      { number: '02', title: 'عرض السعر', description: 'نوضح لك التدخّل المقترح وتكلفته والمدة المتوقعة قبل اتخاذ القرار.' },
      { number: '03', title: 'موافقتك', description: 'يبدأ الإصلاح بعد موافقتك على عرض السعر المقترح.' },
      { number: '04', title: 'استلام الجهاز', description: 'نراجع الجهاز معك ونخبرك عندما يصبح جاهزًا للاستلام.' },
    ],
    requestEyebrow: 'لنتحدّث عن جهازك',
    requestTitle: 'البداية\nرسالة.',
    requestIntro: 'تفاصيل قليلة تكفي لبدء الحديث. سيُفتح طلبك في واتساب كرسالة جاهزة للإرسال.',
    name: 'اسمك', device: 'نوع الجهاز', model: 'الشركة والطراز', problem: 'ما المشكلة؟',
    namePlaceholder: 'اسمك الكامل',
    modelPlaceholder: 'مثال: حاسوب محمول، طراز 2022',
    problemPlaceholder: 'صِف الأعراض ومتى بدأت بالظهور…',
    devicePlaceholder: 'اختر نوع الجهاز',
    deviceOptions: [
      { value: 'phone', label: 'هاتف' }, { value: 'laptop', label: 'حاسوب محمول' },
      { value: 'desktop', label: 'حاسوب مكتبي' }, { value: 'tablet', label: 'جهاز لوحي' },
      { value: 'other', label: 'جهاز آخر' },
    ],
    send: 'تابع عبر واتساب',
    formNote: 'يجهّز هذا النموذج رسالة واتساب. لا يُحفظ الطلب على خادم؛ أنت تختار إرسال الرسالة داخل واتساب.',
    formErrors: {
      name: 'أدخل اسمًا يتكوّن من حرفين إلى 80 حرفًا.',
      device: 'اختر نوع جهازك.',
      model: 'أدخل الشركة والطراز (من حرفين إلى 100 حرف).',
      problem: 'صِف المشكلة في 10 إلى 1500 حرف.',
      whatsapp: 'يجب إضافة رقم واتساب الخاص بالورشة قبل فتح المحادثة.',
    },
    contactEyebrow: 'نلتقي في الورشة',
    contactTitle: `في قلب\n${shopConfig.location.ar}.`,
    addressLabel: 'العنوان', hoursLabel: 'أوقات العمل', phoneLabel: 'الهاتف', whatsappLabel: 'واتساب',
    contactNote: 'هذا موقع تجريبي. يجب إضافة معلومات التواصل الخاصة بالورشة قبل النشر.',
    footerTag: 'العناية في التفاصيل.',
    backTop: 'العودة إلى الأعلى', serviceSelectLabel: 'اختر مكوّنًا',
    fallbackTitle: 'داخل أجهزتكم.',
    fallbackDescription: 'استكشف الخدمات أدناه. يبقى التشخيص وطلب الإصلاح متاحَين دون المشهد ثلاثي الأبعاد.',
    loadingLabel: 'نجهّز الورشة…', close: 'إغلاق', menu: 'فتح القائمة',
    heroDevices: 'حواسيب وهواتف',
    scrollLabel: 'مرّر الصفحة للاستكشاف',
    sceneInteractive: 'مشهد تفاعلي ثلاثي الأبعاد',
    sceneView: 'الورشة من الداخل',
    preciseTag: 'تشخيص. عرض سعر. والقرار لك.',
    demoNotice: 'يجب إضافة معلومات التواصل الخاصة بهذه الورشة التجريبية.',
    fieldsRequired: 'جميع الحقول مطلوبة.',
    requestHint: 'سيُفتح نص رسالتك في واتساب. يمكنك مراجعته قبل الإرسال.',
    navigationLabel: 'التنقل الرئيسي',
    languageLabel: 'اختر اللغة',
    skipLink: 'انتقل إلى المحتوى',
    phoneAction: 'اتصل بالورشة',
  },
}
