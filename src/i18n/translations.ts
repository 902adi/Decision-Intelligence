export type Language = 'en' | 'hi' | 'mr';

export interface Translations {
  app: {
    name: string;
    subname: string;
    tagline: string;
    prototype_badge: string;
    disclaimer: string;
    live_data: string;
    demo_data: string;
    offline_notice: string;
  };
  nav: {
    citizen: string;
    officer: string;
    overview: string;
    map: string;
    forecast: string;
    resources: string;
    routes: string;
    supplies: string;
    scenario_lab: string;
    decision_log: string;
    sos_queue: string;
    settings: string;
  };
  citizen: {
    choose_ward: string;
    use_location: string;
    locating: string;
    safe_badge: string;
    watch_badge: string;
    warning_badge: string;
    emergency_badge: string;
    action_safe_route: string;
    action_sos: string;
    action_helplines: string;
    checkin_question: string;
    checkin_safe_btn: string;
    checkin_help_btn: string;
    checkin_evac_btn: string;
    checkin_recorded: string;
    report_title: string;
    report_subtitle: string;
    report_step1: string;
    report_step2: string;
    report_step3: string;
    type_water: string;
    type_road: string;
    type_power: string;
    type_medical: string;
    report_note_placeholder: string;
    report_submit_btn: string;
    report_sent: string;
    sos_modal_title: string;
    sos_modal_desc: string;
    people_count_label: string;
    need_medical: string;
    need_rescue: string;
    need_food_water: string;
    vulnerable_checkbox: string;
    gps_checkbox: string;
    gps_explanation: string;
    sos_confirm_btn: string;
    sos_tracking_title: string;
    sos_step_received: string;
    sos_step_assigned: string;
    sos_step_enroute: string;
    sos_step_resolved: string;
    sos_cancel_btn: string;
    nearest_camp: string;
    camp_distance: string;
    camp_occupancy: string;
    stock_food: string;
    stock_water: string;
    stock_med: string;
    checklist_title: string;
    privacy_title: string;
    privacy_desc: string;
    privacy_point1: string;
    privacy_point2: string;
    privacy_point3: string;
    privacy_agree_btn: string;
    delete_my_data: string;
    data_deleted_alert: string;
  };
  officer: {
    command_center: string;
    kpi_at_risk: string;
    kpi_critical_wards: string;
    kpi_assets_active: string;
    kpi_camp_capacity: string;
    map_title: string;
    rainfall_intensity: string;
    simulate_flood: string;
    time_travel: string;
    hours_ahead: string;
    ripple_feed: string;
    recommended_actions: string;
    approve: string;
    override: string;
    approved: string;
    overridden: string;
    why_ai: string;
    confidence: string;
    alternatives: string;
    tradeoff: string;
    sos_queue: string;
    priority_score: string;
    assign_resource: string;
    waiting_mins: string;
    people: string;
    two_device_title: string;
    two_device_desc: string;
    open_window_btn: string;
    copy_link_btn: string;
    scenario_lab: string;
    ai_plan: string;
    manual_plan: string;
    decision_log: string;
    export_log: string;
  };
  helplines: {
    title: string;
    subtitle: string;
    smart_router_title: string;
    smart_router_prompt: string;
    situation_trapped: string;
    situation_injured: string;
    situation_road: string;
    situation_missing: string;
    situation_gas: string;
    situation_shelter: string;
    recommended_number: string;
    what_to_say: string;
    have_ready: string;
    why_this_service: string;
    call_now: string;
    confirm_call: string;
    demo_call_alert: string;
    last_verified: string;
  };
  settings: {
    title: string;
    theme: string;
    dark: string;
    light: string;
    text_size: string;
    text_small: string;
    text_normal: string;
    text_large: string;
    calm_mode: string;
    calm_mode_desc: string;
    colorblind: string;
    colorblind_desc: string;
    audio: string;
    audio_desc: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    app: {
      name: "Rakshak",
      subname: "रक्षक",
      tagline: "Decide faster than the water rises.",
      prototype_badge: "Prototype Control Room",
      disclaimer: "Prototype decision intelligence. Does not automatically dispatch municipal forces. In a life-threatening emergency, dial 112 immediately.",
      live_data: "Live data active",
      demo_data: "Showing demo data",
      offline_notice: "Saved on your phone, will send when online.",
    },
    nav: {
      citizen: "Citizen",
      officer: "Officer",
      overview: "Overview",
      map: "Map",
      forecast: "Forecast",
      resources: "Resources",
      routes: "Evacuation",
      supplies: "Supplies",
      scenario_lab: "Scenario Lab",
      decision_log: "Decision Log",
      sos_queue: "SOS Queue",
      settings: "Settings",
    },
    citizen: {
      choose_ward: "Select your area or ward",
      use_location: "Use my current location",
      locating: "Finding your ward...",
      safe_badge: "Low Risk",
      watch_badge: "Moderate Risk",
      warning_badge: "High Risk",
      emergency_badge: "Critical Risk",
      action_safe_route: "Show safe route",
      action_sos: "Call for help (SOS)",
      action_helplines: "Emergency numbers",
      checkin_question: "Are you and your family safe?",
      checkin_safe_btn: "I am safe",
      checkin_help_btn: "I need help",
      checkin_evac_btn: "Evacuating now",
      checkin_recorded: "Status recorded. Thank you for helping the community.",
      report_title: "Report a local issue",
      report_subtitle: "Takes 20 seconds. Alerts emergency responders.",
      report_step1: "1. What is happening?",
      report_step2: "2. Confirm your ward",
      report_step3: "3. Quick note (optional)",
      type_water: "Water rising rapidly",
      type_road: "Road or bridge blocked",
      type_power: "Power line hazard",
      type_medical: "Medical emergency",
      report_note_placeholder: "e.g. Water knee-deep near market gate, 4 people waiting.",
      report_submit_btn: "Submit incident report",
      report_sent: "Report submitted. Emergency desk notified.",
      sos_modal_title: "Request Emergency Rescue",
      sos_modal_desc: "Your request reaches the Rivergate disaster cell directly.",
      people_count_label: "How many people are with you?",
      need_medical: "Immediate medical care",
      need_rescue: "Boat / water rescue",
      need_food_water: "Trapped without drinking water",
      vulnerable_checkbox: "Includes elderly, infants, or disabled individuals",
      gps_checkbox: "Share precise GPS coordinates for rescue boats",
      gps_explanation: "Only shared with active rescue personnel during this incident.",
      sos_confirm_btn: "Send rescue alert",
      sos_tracking_title: "Rescue Status",
      sos_step_received: "Request received",
      sos_step_assigned: "Rescue team assigned",
      sos_step_enroute: "Team on the way",
      sos_step_resolved: "Team arrived / resolved",
      sos_cancel_btn: "Cancel rescue request",
      nearest_camp: "Nearest Relief Camp",
      camp_distance: "walk",
      camp_occupancy: "Capacity filled",
      stock_food: "Food packets",
      stock_water: "Clean water",
      stock_med: "Medical kits",
      checklist_title: "What to do right now",
      privacy_title: "Privacy & Community Protection",
      privacy_desc: "Rakshak protects lives while honoring your privacy.",
      privacy_point1: "No login or password needed for citizens.",
      privacy_point2: "Location is rounded to your ward by default unless you request SOS rescue.",
      privacy_point3: "All personal emergency data is automatically purged after 30 days.",
      privacy_agree_btn: "Understand and continue",
      delete_my_data: "Delete my check-in & report data",
      data_deleted_alert: "All local and submitted session records have been deleted.",
    },
    officer: {
      command_center: "Command Center",
      kpi_at_risk: "Citizens at Risk",
      kpi_critical_wards: "Critical Wards",
      kpi_assets_active: "Assets Deployed",
      kpi_camp_capacity: "Shelter Occupancy",
      map_title: "Rivergate Hydrological & Risk Graph",
      rainfall_intensity: "Rainfall Simulation",
      simulate_flood: "Simulate flood in this ward",
      time_travel: "Timeline Projection",
      hours_ahead: "hours ahead",
      ripple_feed: "Live Ripple Feed",
      recommended_actions: "AI Recommended Interventions",
      approve: "Approve Action",
      override: "Override",
      approved: "Approved & Dispatched",
      overridden: "Overridden by Officer",
      why_ai: "Why this recommendation?",
      confidence: "Confidence Level",
      alternatives: "Alternatives Considered",
      tradeoff: "Impact & Trade-off",
      sos_queue: "Emergency SOS Queue",
      priority_score: "AI Priority",
      assign_resource: "Assign Nearest Unit",
      waiting_mins: "min wait",
      people: "people",
      two_device_title: "Two-Device Demo (Phone + Laptop)",
      two_device_desc: "Scan this QR code with your phone to open the Citizen app. Submit a report or SOS to see it appear on this dashboard in under 1 second.",
      open_window_btn: "Open Citizen in New Window",
      copy_link_btn: "Copy Citizen Link",
      scenario_lab: "Scenario Comparison Lab",
      ai_plan: "Rakshak AI Plan (Proactive)",
      manual_plan: "Traditional Reactive Plan",
      decision_log: "Audit & Decision Log",
      export_log: "Export Summary (JSON / TXT)",
    },
    helplines: {
      title: "Emergency Helplines",
      subtitle: "Verified official disaster and relief contact channels.",
      smart_router_title: "Who should I call?",
      smart_router_prompt: "Select your situation to find the exact number and what to say:",
      situation_trapped: "Trapped by rising water or collapsed structure",
      situation_injured: "Severe injury, unconsciousness or medical crisis",
      situation_road: "Submerged roadway, trapped vehicle, highway wash",
      situation_missing: "Missing child, family member, or elderly person",
      situation_gas: "LPG gas smell, chemical leak, or sparking transformer",
      situation_shelter: "Need dry shelter, dry food rations, or baby food",
      recommended_number: "Call this service",
      what_to_say: "What to say when they answer:",
      have_ready: "Information to have ready:",
      why_this_service: "Why this number:",
      call_now: "Tap to dial",
      confirm_call: "This will open your phone's dialer for",
      demo_call_alert: "Demo Mode: No telephone call was placed. In an emergency dial 112 directly.",
      last_verified: "Last verified by NDMA protocol: Oct 2026",
    },
    settings: {
      title: "System Preferences",
      theme: "Theme Mode",
      dark: "Dark (Calm night)",
      light: "Light (Soft daylight)",
      text_size: "Reading Text Size",
      text_small: "Compact (A-)",
      text_normal: "Standard (A)",
      text_large: "Enlarged (A+)",
      calm_mode: "Calm Mode",
      calm_mode_desc: "Disables rain and motion on background canvas",
      colorblind: "Colorblind Safe Patterns",
      colorblind_desc: "Adds geometric patterns to risk indicators",
      audio: "Audio Atmosphere",
      audio_desc: "Subtle synthesized distant thunder rumble (low volume)",
    }
  },
  hi: {
    app: {
      name: "Rakshak AI",
      subname: "रक्षक AI",
      tagline: "पानी के स्तर से भी तेज़ फैसला लें।",
      prototype_badge: "प्रोटोटाइप नियंत्रण कक्ष",
      disclaimer: "यह आपदा निर्णय सहायता प्रणाली है। आपातकालीन स्थिति में तुरंत 112 डायल करें।",
      live_data: "सक्रिय लाइव डेटा",
      demo_data: "डेमो डेटा प्रदर्शित",
      offline_notice: "फ़ोन पर सुरक्षित, इंटरनेट आने पर भेजा जाएगा।",
    },
    nav: {
      citizen: "नागरिक",
      officer: "अधिकारी",
      overview: "सिंहावलोकन",
      map: "नक्शा",
      forecast: "पूर्वानुमान",
      resources: "संसाधन",
      routes: "निकासी मार्ग",
      supplies: "राहत सामग्री",
      scenario_lab: "परिदृश्य लैब",
      decision_log: "निर्णय लॉग",
      sos_queue: "आपातकालीन कतार",
      settings: "सेटिंग्स",
    },
    citizen: {
      choose_ward: "अपना क्षेत्र या वार्ड चुनें",
      use_location: "मेरा वर्तमान स्थान उपयोग करें",
      locating: "आपका वार्ड खोजा जा रहा है...",
      safe_badge: "कम जोखिम",
      watch_badge: "मध्यम जोखिम",
      warning_badge: "उच्च जोखिम",
      emergency_badge: "गंभीर संकट",
      action_safe_route: "सुरक्षित मार्ग देखें",
      action_sos: "मदद बुलाएं (SOS)",
      action_helplines: "आपातकालीन नंबर",
      checkin_question: "क्या आप और आपका परिवार सुरक्षित हैं?",
      checkin_safe_btn: "मैं सुरक्षित हूँ",
      checkin_help_btn: "मुझे मदद चाहिए",
      checkin_evac_btn: "निकल रहे हैं",
      checkin_recorded: "आपकी स्थिति दर्ज कर ली गई है। धन्यवाद।",
      report_title: "समस्या की सूचना दें",
      report_subtitle: "20 सेकंड में राहत दल को सूचित करें।",
      report_step1: "1. क्या स्थिति है?",
      report_step2: "2. अपने वार्ड की पुष्टि करें",
      report_step3: "3. संक्षिप्त विवरण (वैकल्पिक)",
      type_water: "पानी तेज़ी से बढ़ रहा है",
      type_road: "सड़क या पुल बंद है",
      type_power: "बिजली का तार टूटा है",
      type_medical: "चिकित्सा आपातकाल",
      report_note_placeholder: "उदा. मुख्य बाज़ार के पास घुटनों तक पानी, 4 लोग फंसे हैं।",
      report_submit_btn: "रिपोर्ट दर्ज करें",
      report_sent: "रिपोर्ट दर्ज हुई। नियंत्रण कक्ष को सूचित कर दिया गया।",
      sos_modal_title: "आपातकालीन बचाव अनुरोध",
      sos_modal_desc: "आपका अनुरोध सीधे रिवरगेट आपदा राहत दल तक पहुंचेगा।",
      people_count_label: "आपके साथ कितने लोग हैं?",
      need_medical: "तत्काल चिकित्सा सहायता",
      need_rescue: "नाव या बचाव दल की जरूरत",
      need_food_water: "पीने के पानी या भोजन के बिना फंसे हैं",
      vulnerable_checkbox: "बुजुर्ग, नवजात शिशु या दिव्यांगजन शामिल हैं",
      gps_checkbox: "बचाव नौका के लिए सटीक GPS स्थान साझा करें",
      gps_explanation: "यह केवल सक्रिय राहत दल के साथ ही साझा किया जाएगा।",
      sos_confirm_btn: "बचाव संदेश भेजें",
      sos_tracking_title: "बचाव स्थिति",
      sos_step_received: "अनुरोध प्राप्त हुआ",
      sos_step_assigned: "दल नियुक्त किया गया",
      sos_step_enroute: "दल रास्ते में है",
      sos_step_resolved: "दल पहुंच गया / सुरक्षित",
      sos_cancel_btn: "अनुरोध रद्द करें",
      nearest_camp: "निकटतम राहत शिविर",
      camp_distance: "पैदल दूरी",
      camp_occupancy: "क्षमता भरी",
      stock_food: "भोजन पैकेट",
      stock_water: "स्वच्छ पानी",
      stock_med: "दवा किट",
      checklist_title: "अभी क्या करना चाहिए",
      privacy_title: "गोपनीयता और नागरिक सुरक्षा",
      privacy_desc: "रक्षक AI आपकी निजता का पूरा सम्मान करता है।",
      privacy_point1: "नागरिकों के लिए किसी पासवर्ड या खाते की आवश्यकता नहीं है।",
      privacy_point2: "आपका स्थान केवल वार्ड स्तर तक सीमित रखा जाता है।",
      privacy_point3: "आपातकाल समाप्त होने के 30 दिनों बाद सारा व्यक्तिगत डेटा स्वतः मिट जाता है।",
      privacy_agree_btn: "सहमत हैं और आगे बढ़ें",
      delete_my_data: "मेरा दर्ज डेटा हटाएं",
      data_deleted_alert: "आपका सभी स्थानीय डेटा हटा दिया गया है।",
    },
    officer: {
      command_center: "कमांड सेंटर",
      kpi_at_risk: "जोखिम में नागरिक",
      kpi_critical_wards: "गंभीर वार्ड",
      kpi_assets_active: "तैनात संसाधन",
      kpi_camp_capacity: "शिविर अधिभोग",
      map_title: "रिवरगेट जलस्तर एवं जोखिम मानचित्र",
      rainfall_intensity: "वर्षा तीव्रता सिमुलेशन",
      simulate_flood: "इस वार्ड में बाढ़ का अनुकरण करें",
      time_travel: "समय प्रक्षेपण",
      hours_ahead: "घंटे आगे",
      ripple_feed: "सक्रिय रिपल फीड",
      recommended_actions: "AI अनुशंसित राहत कार्रवाई",
      approve: "कार्रवाई स्वीकृत करें",
      override: "बदलाव (ओवरराइड)",
      approved: "स्वीकृत और रवाना",
      overridden: "अधिकारी द्वारा संशोधित",
      why_ai: "यह सिफारिश क्यों?",
      confidence: "विश्वास स्तर",
      alternatives: "वैकल्पिक विकल्प",
      tradeoff: "प्रभाव और समझौता",
      sos_queue: "आपातकालीन SOS कतार",
      priority_score: "AI प्राथमिकता",
      assign_resource: "निकटतम इकाई भेजें",
      waiting_mins: "मिनट प्रतीक्षा",
      people: "लोग",
      two_device_title: "दो-डिवाइस डेमो (फोन + लैपटॉप)",
      two_device_desc: "नागरिक ऐप खोलने के लिए अपने फोन से यह QR कोड स्कैन करें। फोन पर रिपोर्ट भेजते ही 1 सेकंड में इस स्क्रीन पर रिपल प्रभाव दिखेगा।",
      open_window_btn: "नई विंडो में नागरिक ऐप खोलें",
      copy_link_btn: "लिंक कॉपी करें",
      scenario_lab: "परिदृश्य तुलना लैब",
      ai_plan: "रक्षक AI अनुकूलित योजना",
      manual_plan: "पारंपरिक प्रतिक्रिया योजना",
      decision_log: "निर्णय एवं ऑडिट लॉग",
      export_log: "सारांश निर्यात करें (JSON / TXT)",
    },
    helplines: {
      title: "आपातकालीन हेल्पलाइन",
      subtitle: "सत्यापित आधिकारिक आपदा और राहत संपर्क सेवाएं।",
      smart_router_title: "किसे कॉल करना चाहिए?",
      smart_router_prompt: "अपनी स्थिति चुनें ताकि सही नंबर और बात करने का तरीका पता चले:",
      situation_trapped: "बढ़ते पानी या गिरी इमारत में फंसे हुए हैं",
      situation_injured: "गंभीर चोट, बेहोशी या चिकित्सा संकट",
      situation_road: "सड़क या पुल जलमग्न, फंसा हुआ वाहन",
      situation_missing: "लापता बच्चा, बुजुर्ग या परिवार का सदस्य",
      situation_gas: "गैस रिसाव, रासायनिक गंध या बिजली का खंभा स्पार्क",
      situation_shelter: "सूखा आश्रय, सूखा राशन या बच्चों का भोजन चाहिए",
      recommended_number: "इस नंबर पर संपर्क करें",
      what_to_say: "कॉल उठाने पर क्या बोलें:",
      have_ready: "जानकारी तैयार रखें:",
      why_this_service: "यह नंबर क्यों चुना गया:",
      call_now: "कॉल करने के लिए टैप करें",
      confirm_call: "यह आपके फोन डायलर में खोलेगा",
      demo_call_alert: "डेमो मोड: वास्तविक कॉल नहीं लगाई गई। आपातकाल में सीधे 112 डायल करें।",
      last_verified: "एनडीएमए द्वारा सत्यापित: अक्टूबर 2026",
    },
    settings: {
      title: "सिस्टम प्राथमिकताएं",
      theme: "थीम मोड",
      dark: "डार्क (शांत रात्रि)",
      light: "लाइट (हल्का दिन)",
      text_size: "पाठ का आकार",
      text_small: "छोटा (A-)",
      text_normal: "मानक (A)",
      text_large: "बड़ा (A+)",
      calm_mode: "शांत मोड",
      calm_mode_desc: "पृष्ठभूमि में बारिश और एनिमेशन बंद करें",
      colorblind: "कलरब्लाइंड अनुकूल पैटर्न",
      colorblind_desc: "जोखिम संकेतकों पर ज्यामितीय पैटर्न जोड़ें",
      audio: "ध्वनि वातावरण",
      audio_desc: "हल्की गड़गड़ाहट की ध्वनि (शांत और कम आवाज़)",
    }
  },
  mr: {
    app: {
      name: "Rakshak AI",
      subname: "रक्षक AI",
      tagline: "पाण्याच्या पातळीपेक्षा जलद निर्णय घ्या.",
      prototype_badge: "प्रोटोटाइप नियंत्रण कक्ष",
      disclaimer: "ही पूर प्रतिसाद निर्णय प्रणाली आहे. तातडीच्या आपत्कालीन प्रसंगी लगेच 112 डायल करा.",
      live_data: "थेट डेटा सुरू आहे",
      demo_data: "डेमो डेटा दर्शवत आहे",
      offline_notice: "फोनवर साठवले आहे, इंटरनेट आल्यावर पाठवले जाईल.",
    },
    nav: {
      citizen: "नागरिक",
      officer: "अधिकारी",
      overview: "आढावा",
      map: "नकाशा",
      forecast: "अंदाज",
      resources: "साधने",
      routes: "स्थलांतर मार्ग",
      supplies: "मदत साहित्य",
      scenario_lab: "परिदृश्य लॅब",
      decision_log: "निर्णय नोंद",
      sos_queue: "आपत्कालीन रांग",
      settings: "सेटिंग्ज",
    },
    citizen: {
      choose_ward: "आपला परिसर किंवा प्रभाग निवडा",
      use_location: "माझे सध्याचे स्थान वापरा",
      locating: "आपला प्रभाग शोधत आहे...",
      safe_badge: "कमी धोका",
      watch_badge: "मध्यम धोका",
      warning_badge: "जास्त धोका",
      emergency_badge: "गंभीर संकट",
      action_safe_route: "सुरक्षित मार्ग दाखवा",
      action_sos: "मदत बोलवा (SOS)",
      action_helplines: "आपत्कालीन क्रमांक",
      checkin_question: "तुम्ही आणि तुमचे कुटुंब सुरक्षित आहात का?",
      checkin_safe_btn: "मी सुरक्षित आहे",
      checkin_help_btn: "मला मदत हवी आहे",
      checkin_evac_btn: "बाहेर पडत आहोत",
      checkin_recorded: "तुमची स्थिती नोंदवली आहे. सहकार्याबद्दल धन्यवाद.",
      report_title: "समस्येची माहिती द्या",
      report_subtitle: "२० सेकंदात मदत पथकाला कळवा.",
      report_step1: "१. काय परिस्थिती आहे?",
      report_step2: "२. प्रभागाची खात्री करा",
      report_step3: "३. थोडी माहिती (पर्यायी)",
      type_water: "पाणी वेगाने वाढत आहे",
      type_road: "रस्ता किंवा पूल बंद आहे",
      type_power: "विजेची तार तुटली आहे",
      type_medical: "वैद्यकीय आणीबाणी",
      report_note_placeholder: "उदा. मुख्य बाजाराजवळ गुडघाभर पाणी, ४ लोक अडकले आहेत.",
      report_submit_btn: "माहिती पाठवा",
      report_sent: "माहिती पाठवली. नियंत्रण कक्षाला कळवले आहे.",
      sos_modal_title: "तातडीचा बचाव संदेश",
      sos_modal_desc: "तुमचा संदेश थेट रिव्हरगेट आपत्ती निवारण कक्षापर्यंत पोहोचेल.",
      people_count_label: "तुमच्यासोबत किती व्यक्ती आहेत?",
      need_medical: "तातडीची वैद्यकीय मदत",
      need_rescue: "बोट किंवा बचाव पथक हवे",
      need_food_water: "पिण्याचे पाणी किंवा अन्नाशिवाय अडकलो आहोत",
      vulnerable_checkbox: "वृद्ध, लहान मुले किंवा दिव्यांग व्यक्ती आहेत",
      gps_checkbox: "बचाव बोटीसाठी अचूक GPS स्थान शेअर करा",
      gps_explanation: "केवळ सक्रिय बचाव पथकासोबतच शेअर केले जाईल.",
      sos_confirm_btn: "बचाव संदेश पाठवा",
      sos_tracking_title: "बचाव स्थिती",
      sos_step_received: "संदेश मिळाला",
      sos_step_assigned: "पथक नेमले आहे",
      sos_step_enroute: "पथक मार्गावर आहे",
      sos_step_resolved: "पथक पोहोचले / सुरक्षित",
      sos_cancel_btn: "संदेश रद्द करा",
      nearest_camp: "जवळचे मदत शिबिर",
      camp_distance: "पायी अंतर",
      camp_occupancy: "क्षमता भरली",
      stock_food: "अन्न पाकिटे",
      stock_water: "पिण्याचे पाणी",
      stock_med: "औषध किट्स",
      checklist_title: "आता काय करावे",
      privacy_title: "गोपनीयता आणि नागरिक संरक्षण",
      privacy_desc: "रक्षक AI आपल्या गोपनीयतेचा पूर्ण आदर करते.",
      privacy_point1: "नागरिकांसाठी कोणत्याही पासवर्डची गरज नाही.",
      privacy_point2: "आपले स्थान केवळ प्रभाग पातळीपर्यंत मर्यादित ठेवले जाते.",
      privacy_point3: "संकट संपल्यानंतर ३० दिवसांनी सर्व वैयक्तिक माहिती आपोआप नष्ट होते.",
      privacy_agree_btn: "मान्य आहे आणि पुढे जा",
      delete_my_data: "माझा डेटा हटवा",
      data_deleted_alert: "तुमचा स्थानिक डेटा हटवला गेला आहे.",
    },
    officer: {
      command_center: "कमांड सेंटर",
      kpi_at_risk: "धोक्यात असलेले नागरिक",
      kpi_critical_wards: "गंभीर प्रभाग",
      kpi_assets_active: "तैनात साधनसामग्री",
      kpi_camp_capacity: "शिबिर वापर",
      map_title: "रिव्हरगेट जलपातळी व धोका आलेख",
      rainfall_intensity: "पाऊस तीव्रता सिम्युलेशन",
      simulate_flood: "या प्रभागात पुराचे अनुकरण करा",
      time_travel: "वेळेचा अंदाज",
      hours_ahead: "तास पुढे",
      ripple_feed: "थेट रिपल फीड",
      recommended_actions: "AI सुचवलेल्या उपाययोजना",
      approve: "कृती मंजूर करा",
      override: "बदला (ओव्हरराइड)",
      approved: "मंजूर व रवाना",
      overridden: "अधिकार्‍यांनी बदलले",
      why_ai: "ही शिफारस का?",
      confidence: "विश्वास पातळी",
      alternatives: "विचार केलेले पर्याय",
      tradeoff: "परिणाम आणि तडजोड",
      sos_queue: "आपत्कालीन SOS रांग",
      priority_score: "AI प्राधान्य",
      assign_resource: "जवळचे पथक पाठवा",
      waiting_mins: "मिनिटे प्रतीक्षा",
      people: "व्यक्ती",
      two_device_title: "दोन-डिव्हाइस डेमो (फोन + लॅपटॉप)",
      two_device_desc: "नागरिक ॲप उघडण्यासाठी फोनवरून हा QR कोड स्कॅन करा. फोनवरून अहवाल पाठवताच एका सेकंदात या डॅशबोर्डवर रिपल प्रभाव दिसेल.",
      open_window_btn: "नागरिक ॲप नवीन विंडोमध्ये उघडा",
      copy_link_btn: "लिंक कॉपी करा",
      scenario_lab: "परिदृश्य तुलना लॅब",
      ai_plan: "रक्षक AI अनुकूलित योजना",
      manual_plan: "पारंपरिक प्रतिक्रिया योजना",
      decision_log: "निर्णय नोंद व ऑडिट",
      export_log: "नोंदणी निर्यात करा (JSON / TXT)",
    },
    helplines: {
      title: "आपत्कालीन मदत क्रमांक",
      subtitle: "प्रमाणित अधिकृत आपत्ती निवारण व मदत संपर्क क्रमांक.",
      smart_router_title: "कोणाला फोन करावा?",
      smart_router_prompt: "आपली परिस्थिती निवडा, अचूक नंबर आणि काय बोलावे ते समजेल:",
      situation_trapped: "पाणी साचल्यामुळे किंवा इमारत पडल्याने अडकलो आहोत",
      situation_injured: "गंभीर दुखापत, बेशुद्धी किंवा वैद्यकीय आणीबाणी",
      situation_road: "रस्ता किंवा पूल पाण्याखाली, अडकलेले वाहन",
      situation_missing: "हरवलेले मूल, वृद्ध किंवा घरातील व्यक्ती",
      situation_gas: "गॅस गळती, रसायनांचा वास किंवा विजेच्या तारा ठिणग्या",
      situation_shelter: "कोरडा निवारा, अन्न किंवा बाळाचे दूध हवे आहे",
      recommended_number: "या क्रमांकावर संपर्क साधा",
      what_to_say: "कॉल उचलल्यावर काय सांगावे:",
      have_ready: "माहिती तयार ठेवा:",
      why_this_service: "हा नंबर का निवडला:",
      call_now: "कॉल करण्यासाठी दाबा",
      confirm_call: "हे तुमच्या फोन डायलरमध्ये उघडेल",
      demo_call_alert: "डेमो मोड: फोन लागलेला नाही. प्रत्यक्ष संकटात ११२ डायल करा.",
      last_verified: "एनडीएमए द्वारे पडताळणी: ऑक्टोबर २०२६",
    },
    settings: {
      title: "प्रणाली प्राधान्ये",
      theme: "थीम मोड",
      dark: "डार्क (शांत रात्र)",
      light: "लाइट (शांत दिवस)",
      text_size: "फॉन्ट आकार",
      text_small: "लहान (A-)",
      text_normal: "प्रमाणित (A)",
      text_large: "मोठा (A+)",
      calm_mode: "शांत मोड",
      calm_mode_desc: "मागील पावसाचे आणि पाण्याचे ॲनिमेशन बंद करा",
      colorblind: "कलरब्लाइंड सुरक्षित पॅटर्न",
      colorblind_desc: "धोका दर्शकांवर भौमितिक डिझाईन जोडा",
      audio: "ध्वनी वातावरण",
      audio_desc: "हलक्या ढगांचा गडगडाट (शांत व मंद आवाज)",
    }
  }
};
