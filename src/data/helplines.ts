export interface HelplineItem {
  id: string;
  number: string;
  name: { en: string; hi: string; mr: string };
  category: 'national_emergency' | 'disaster' | 'police_fire' | 'medical' | 'vulnerable' | 'local_demo';
  description: { en: string; hi: string; mr: string };
  isDemo?: boolean;
  isPinned?: boolean;
  lastVerified: string;
}

export interface SmartRouterOption {
  id: string;
  titleKey: 'situation_trapped' | 'situation_injured' | 'situation_road' | 'situation_missing' | 'situation_gas' | 'situation_shelter';
  recommendedNumber: string;
  serviceName: { en: string; hi: string; mr: string };
  script: {
    en: string;
    hi: string;
    mr: string;
  };
  haveReady: {
    en: string;
    hi: string;
    mr: string;
  };
  why: {
    en: string;
    hi: string;
    mr: string;
  };
}

export const helplinesData: HelplineItem[] = [
  {
    id: '112',
    number: '112',
    name: {
      en: 'National Emergency Response Support System',
      hi: 'राष्ट्रीय आपातकालीन सेवा (ERSS)',
      mr: 'राष्ट्रीय आपत्कालीन सेवा (ERSS)'
    },
    category: 'national_emergency',
    description: {
      en: 'Single unified emergency number across India for Police, Fire, Ambulance & Disaster.',
      hi: 'पुलिस, अग्निशमन, एम्बुलेंस और आपदा के लिए भारत भर में एकल आपातकालीन नंबर।',
      mr: 'पोलीस, अग्निशामक, रुग्णवाहिका आणि आपत्तीसाठी संपूर्ण भारतात एकच क्रमांक.'
    },
    isPinned: true,
    lastVerified: 'October 2026',
  },
  {
    id: 'ndrf',
    number: '011-24363260',
    name: {
      en: 'National Disaster Response Force (NDRF)',
      hi: 'राष्ट्रीय आपदा मोचन बल (NDRF)',
      mr: 'राष्ट्रीय आपत्ती निवारण दल (NDRF)'
    },
    category: 'disaster',
    description: {
      en: 'Specialized flood rescue boats, deep water extraction, structural collapse.',
      hi: 'बाढ़ राहत नाव, गहरे पानी से बचाव और संरचनात्मक राहत दल।',
      mr: 'पूर बचाव बोटी, खोल पाण्यातील बचाव आणि कोसळलेल्या इमारतींचे निवारण.'
    },
    lastVerified: 'October 2026',
  },
  {
    id: 'ndma',
    number: '1078',
    name: {
      en: 'NDMA Disaster Control Room',
      hi: 'एनडीएमए आपदा नियंत्रण कक्ष',
      mr: 'एनडीएमए आपत्ती नियंत्रण कक्ष'
    },
    category: 'disaster',
    description: {
      en: 'National Disaster Management Authority 24x7 control room for severe events.',
      hi: 'गंभीर आपदाओं के लिए राष्ट्रीय आपदा प्रबंधन प्राधिकरण का 24x7 नियंत्रण कक्ष।',
      mr: 'मोठ्या आपत्तींसाठी राष्ट्रीय आपत्ती व्यवस्थापन प्राधिकरणाचा २४x७ नियंत्रण कक्ष.'
    },
    lastVerified: 'October 2026',
  },
  {
    id: '1070',
    number: '1070',
    name: {
      en: 'State Relief Commissioner',
      hi: 'राज्य राहत आयुक्त',
      mr: 'राज्य मदत व पुनर्वसन आयुक्त'
    },
    category: 'disaster',
    description: {
      en: 'State level disaster coordination, air-drop requests, camp distribution.',
      hi: 'राज्य स्तर पर आपदा समन्वय, राहत सामग्री और शिविर व्यवस्था।',
      mr: 'राज्यस्तरीय आपत्ती समन्वय, मदत साहित्य आणि शिबिर व्यवस्थापन.'
    },
    lastVerified: 'October 2026',
  },
  {
    id: '108',
    number: '108',
    name: {
      en: 'Emergency Medical & Ambulance (EMRI)',
      hi: 'आपातकालीन चिकित्सा एवं एम्बुलेंस',
      mr: 'तातडीची वैद्यकीय मदत व रुग्णवाहिका'
    },
    category: 'medical',
    description: {
      en: 'Advanced life support & basic ambulances with trained paramedics.',
      hi: 'प्रशिक्षित पैरामेडिक्स के साथ जीवन रक्षक एम्बुलेंस सेवा।',
      mr: 'प्रशिक्षित कर्मचाऱ्यांसह तातडीची रुग्णवाहिका सेवा.'
    },
    lastVerified: 'October 2026',
  },
  {
    id: '101',
    number: '101',
    name: {
      en: 'Fire & Rescue Service',
      hi: 'अग्निशमन एवं बचाव सेवा',
      mr: 'अग्निशामक व बचाव सेवा'
    },
    category: 'police_fire',
    description: {
      en: 'Water pump assistance, electrical wire isolation, swift water rescue.',
      hi: 'जल निकासी पंप सहायता, बिजली के तारों से सुरक्षा, त्वरित बचाव।',
      mr: 'पाणी उपसा पंप मदत, विजेच्या तारांपासून सुरक्षितता, बचाव कार्य.'
    },
    lastVerified: 'October 2026',
  },
  {
    id: '100',
    number: '100',
    name: {
      en: 'Police Control Room',
      hi: 'पुलिस नियंत्रण कक्ष',
      mr: 'पोलीस नियंत्रण कक्ष'
    },
    category: 'police_fire',
    description: {
      en: 'Law and order, perimeter evacuation, traffic diversions around submerged roads.',
      hi: 'कानून व्यवस्था, सुरक्षित घेराव, जलमग्न सड़कों से यातायात परिवर्तन।',
      mr: 'कायदा व सुव्यवस्था, स्थलांतर सहकार्य, वाहतूक वळवणे.'
    },
    lastVerified: 'October 2026',
  },
  {
    id: '1073',
    number: '1073',
    name: {
      en: 'National Highway Emergency',
      hi: 'राष्ट्रीय राजमार्ग आपातकालीन सेवा',
      mr: 'राष्ट्रीय महामार्ग आपत्कालीन सेवा'
    },
    category: 'police_fire',
    description: {
      en: 'Highway accidents, washed out bypasses, trapped trucks and vehicles.',
      hi: 'राजमार्ग दुर्घटनाएं, जलमग्न पुल, फंसे हुए वाहन और बाईपास रुकावटें।',
      mr: 'महामार्ग अपघात, पाण्याखाली गेलेले पूल, अडकलेली वाहने.'
    },
    lastVerified: 'October 2026',
  },
  {
    id: '1098',
    number: '1098',
    name: {
      en: 'Childline Emergency',
      hi: 'चाइल्डलाइन आपातकालीन सेवा',
      mr: 'चाइल्डलाइन आपत्कालीन सेवा'
    },
    category: 'vulnerable',
    description: {
      en: 'Separated children, unaccompanied minors during flood evacuations.',
      hi: 'बाढ़ के दौरान बिछड़े हुए बच्चे, अनाथ या अकेले फंसे नाबालिग।',
      mr: 'पुरामध्ये हरवलेली मुले, एकटे अडकलेले लहान मुले.'
    },
    lastVerified: 'October 2026',
  },
  {
    id: '14567',
    number: '14567',
    name: {
      en: 'Elder Line (Senior Citizens)',
      hi: 'एल्डर लाइन (वरिष्ठ नागरिक)',
      mr: 'एल्डर लाइन (ज्येष्ठ नागरिक)'
    },
    category: 'vulnerable',
    description: {
      en: 'Rescue prioritization for immobile seniors, emergency insulin/dialysis.',
      hi: 'वृद्धजनों के लिए प्राथमिक बचाव, आपातकालीन इंसुलिन और दवाएं।',
      mr: 'हालचाल करू न शकणाऱ्या ज्येष्ठांसाठी प्राधान्य बचाव, तातडीची औषधे.'
    },
    lastVerified: 'October 2026',
  },
  {
    id: '1091',
    number: '1091',
    name: {
      en: 'Women Helpline',
      hi: 'महिला हेल्पलाइन',
      mr: 'महिला हेल्पलाइन'
    },
    category: 'vulnerable',
    description: {
      en: 'Safety, pregnant women emergency transit, dedicated female officers.',
      hi: 'सुरक्षा, गर्भवती महिलाओं के लिए आपातकालीन सुरक्षित परिवहन।',
      mr: 'सुरक्षितता, गरोदर महिलांसाठी सुरक्षित वाहतूक.'
    },
    lastVerified: 'October 2026',
  },
  {
    id: '1906',
    number: '1906',
    name: {
      en: 'LPG Gas Leak Helpline',
      hi: 'एलपीजी गैस रिसाव हेल्पलाइन',
      mr: 'एलपीजी गॅस गळती हेल्पलाइन'
    },
    category: 'disaster',
    description: {
      en: 'Submerged gas cylinders, pipeline rupture, chemical smell containment.',
      hi: 'बाढ़ में डूबे गैस सिलेंडर, पाइपलाइन रिसाव और दुर्गंध की जांच।',
      mr: 'पाण्याखालील गॅस सिलिंडर, पाईपलाईन गळती.'
    },
    lastVerified: 'October 2026',
  },
  {
    id: 'rivergate_cell',
    number: '0000-000-000',
    name: {
      en: 'Rivergate Disaster Management Cell (Demo)',
      hi: 'रिवरगेट आपदा प्रबंधन कक्ष (डेमो)',
      mr: 'रिव्हरगेट आपत्ती निवारण कक्ष (डेमो)'
    },
    category: 'local_demo',
    description: {
      en: 'Rivergate local municipal command unit (Simulated demo number).',
      hi: 'रिवरगेट नगर निगम आपदा इकाई (अनुकरण किया गया डेमो नंबर)।',
      mr: 'रिव्हरगेट महानगरपालिका आपत्ती कक्ष (सिम्युलेटेड डेमो क्रमांक).'
    },
    isDemo: true,
    lastVerified: 'October 2026',
  }
];

export const smartRouterOptions: SmartRouterOption[] = [
  {
    id: 'trapped',
    titleKey: 'situation_trapped',
    recommendedNumber: '112 / NDRF (011-24363260)',
    serviceName: {
      en: 'National Emergency Response (112) + NDRF Water Rescue',
      hi: 'राष्ट्रीय आपातकालीन सेवा (112) एवं एनडीआरएफ जल बचाव',
      mr: 'राष्ट्रीय आपत्कालीन सेवा (112) आणि एनडीआरएफ बचाव पथक'
    },
    script: {
      en: '"I am trapped by rising flood water at [Area/Landmark]. We are [Number] people including [Children/Seniors]. Water level is currently [waist/chest high]."',
      hi: '"हम [क्षेत्र/स्थान] में बाढ़ के पानी में फंसे हैं। हम कुल [संख्या] लोग हैं, जिनमें [बुजुर्ग/बच्चे] हैं। पानी [कमर/छाती] तक आ चुका है।"',
      mr: '"आम्ही [परिसर/खूण] येथे पुराच्या पाण्यात अडकलो आहोत. आम्ही [संख्या] लोक आहोत, ज्यामध्ये [वृद्ध/लहान मुले] आहेत. पाणी [कंबरेपर्यंत/छातीपर्यंत] आले आहे."'
    },
    haveReady: {
      en: 'Exact building/floor, nearby landmark (temple/school/tower), visible rooftop or balcony access, battery level.',
      hi: 'सटीक इमारत/मंजिल, निकटतम पहचान (मंदिर/स्कूल/टावर), छत पर जाने का रास्ता, फोन की बची हुई बैटरी।',
      mr: 'इमारत/मजला, जवळची खूण (मंदिर/शाळा/टावर), छतावर जाण्याचा मार्ग, मोबाईलची बॅटरी.'
    },
    why: {
      en: '112 coordinates with regional boat rescue squads and logs instant GPS triangulations to the nearest NDRF battalion.',
      hi: '112 सीधे निकटतम नौका बचाव दलों से संपर्क करता है और एनडीआरएफ को तुरंत जीपीएस निर्देशांक भेजता है।',
      mr: '112 स्थानिक बचाव बोटींशी समन्वय साधते आणि एनडीआरएफ पथकाला तात्काळ माहिती पुरवते.'
    }
  },
  {
    id: 'injured',
    titleKey: 'situation_injured',
    recommendedNumber: '108 (EMRI) or 112',
    serviceName: {
      en: 'Emergency Medical Service 108',
      hi: 'आपातकालीन चिकित्सा सेवा 108',
      mr: 'तातडीची रुग्णवाहिका १०८'
    },
    script: {
      en: '"Medical emergency at [Location]. Patient is [conscious/unconscious/bleeding] with [nature of injury]. Need urgent high-clearance ambulance."',
      hi: '"[स्थान] पर चिकित्सा आपातकाल है। मरीज [होश में/बेहोश/रक्तस्राव] है। तुरंत जल प्रतिरोधी एम्बुलेंस भेजें।"',
      mr: '"[स्थान] येथे वैद्यकीय आणीबाणी आहे. रुग्ण [शुद्धीवर/बेशुद्ध/रक्तस्त्राव] आहे. तातडीने रुग्णवाहिका पाठवा."'
    },
    haveReady: {
      en: 'Patient age, breathing status, severe allergies, dry accessible pickup spot.',
      hi: 'मरीज की उम्र, सांस लेने की स्थिति, सूखा और सुरक्षित पिकअप स्थान।',
      mr: 'रुग्णाचे वय, श्वासोच्छ्वास, कोरडी व सुरक्षित भेटण्याची जागा.'
    },
    why: {
      en: '108 routes directly to dispatch paramedics equipped with trauma packs and connects to functioning hospital ERs.',
      hi: '108 सीधे आपातकालीन पैरामेडिक्स से संपर्क कराता है और चालू अस्पताल में बेड सुरक्षित करता है।',
      mr: '108 थेट सुसज्ज पॅरामेडिक्सशी संपर्क करते आणि सुरक्षित रुग्णालयाची खात्री करते.'
    }
  },
  {
    id: 'road',
    titleKey: 'situation_road',
    recommendedNumber: '1073 (Highway) / 100 (Traffic Police)',
    serviceName: {
      en: 'Traffic Emergency & Highway Patrol',
      hi: 'यातायात आपातकाल एवं हाईवे पेट्रोल',
      mr: 'वाहतूक नियंत्रण व महामार्ग गस्त'
    },
    script: {
      en: '"Roadway is submerged and impassable at [Road Name / Bridge / Km marker]. Vehicles are getting stalled. Need traffic barricade and diversion immediately."',
      hi: '"[सड़क/पुल] पर पानी भर गया है और रास्ता पूरी तरह बंद है। वाहन फंस रहे हैं। तुरंत बैरिकेड लगाकर रास्ता डायवर्ट करें।"',
      mr: '"[रस्ता/पूल] पाण्याखाली गेला असून मार्ग बंद झाला आहे. वाहने अडकत आहेत. लगेच रस्ता वळवा आणि बॅरिकेड लावा."'
    },
    haveReady: {
      en: 'Direction of flow (e.g. Northbound to Rivergate), estimated water depth across tarmac, stranded vehicles.',
      hi: 'मार्ग की दिशा, सड़क पर पानी की गहराई, वहां फंसे वाहनों की संख्या।',
      mr: 'मार्गाची दिशा, रस्त्यावरील पाण्याची खोली, अडकलेली वाहने.'
    },
    why: {
      en: 'Prevents mass vehicle wash-aways by placing perimeter roadblocks before other motorists enter the flash flood zone.',
      hi: 'अन्य वाहनों को पानी में बहने से रोकने के लिए पुलिस तुरंत दूर से ही ट्रैफिक मोड़ देती है।',
      mr: 'इतर वाहने वाहून जाण्यापासून वाचवण्यासाठी पोलीस लगेच वाहतूक सुरक्षित मार्गाने वळवतात.'
    }
  },
  {
    id: 'missing',
    titleKey: 'situation_missing',
    recommendedNumber: '1098 (Child) / 100 (Police Control)',
    serviceName: {
      en: 'Missing Persons & Evacuation Relief Desk',
      hi: 'लापता व्यक्ति एवं निकासी राहत डेस्क',
      mr: 'बेपत्ता व्यक्ती व स्थलांतर कक्ष'
    },
    script: {
      en: '"Reporting missing person separated during evacuation at [Ward/Camp]. Name: [Name], Age: [Age], wearing [Color/clothes]. Last seen at [Time & Place]."',
      hi: '"निकासी के दौरान बिछड़े व्यक्ति की सूचना: नाम [नाम], उम्र [उम्र], पहने हुए कपड़े [रंग], अंतिम बार देखा गया [समय व स्थान]।"',
      mr: '"स्थलांतरादरम्यान हरवलेल्या व्यक्तीची नोंद: नाव [नाव], वय [वय], कपड्यांचा रंग [रंग], शेवटचे पाहिलेले ठिकाण व वेळ [वेळ]."'
    },
    haveReady: {
      en: 'Recent photo on phone, identification card details, any mobile number they might have.',
      hi: 'फोन में हाल का फोटो, पहचान पत्र का विवरण, उनके पास मौजूद कोई फोन नंबर।',
      mr: 'मोबाईलमधील अलीकडचा फोटो, ओळखपत्र, त्यांचा चालू असणारा फोन नंबर.'
    },
    why: {
      en: 'Broadcasts details across all 4 Rivergate relief camps and rescue boat registers immediately.',
      hi: 'सभी 4 राहत शिविरों और बचाव नौकाओं के रजिस्टर में तत्काल विवरण प्रसारित करता है।',
      mr: 'सर्व ४ मदत शिबिरे आणि बचाव बोटींच्या नोंदवहीत तात्काळ शोध माहिती प्रसारित करते.'
    }
  },
  {
    id: 'gas',
    titleKey: 'situation_gas',
    recommendedNumber: '1906 (Gas Leak) & 101 (Fire)',
    serviceName: {
      en: 'LPG Emergency & Fire Services',
      hi: 'एलपीजी आपातकाल एवं अग्निशमन सेवा',
      mr: 'गॅस गळती व अग्निशामक सेवा'
    },
    script: {
      en: '"Strong chemical / LPG gas odor near [Address]. High flood water present. Danger of spark or ignition. Please isolate local supply line."',
      hi: '"[पते] के पास तेज गैस/रासायनिक दुर्गंध आ रही है। पानी भरा है और चिंगारी का खतरा है। कृपया मुख्य सप्लाई बंद करें।"',
      mr: '"[पत्ता] येथे तीव्र गॅस किंवा रसायनाचा वास येत आहे. पूर आला असून आग लागण्याचा धोका आहे. कृपया पुरवठा बंद करा."'
    },
    haveReady: {
      en: 'Is it residential cylinder or industrial line, visible bubbling in flood water, distance from electrical poles.',
      hi: 'घरेलू सिलेंडर है या पाइपलाइन, पानी में बुलबुले दिख रहे हैं या नहीं, बिजली के खंभे से दूरी।',
      mr: 'घरगुती सिलिंडर आहे की पाईपलाईन, पाण्यात बुडबुडे दिसतात का, विजेच्या खांबापासून अंतर.'
    },
    why: {
      en: 'Gas vapors stay trapped at water surface level; specialized foam response prevents catastrophic ignition.',
      hi: 'पानी की सतह पर गैस की परत जम जाती है, जिसे नियंत्रित करने के लिए अग्निशामक विशेष फोम का उपयोग करते हैं।',
      mr: 'पाण्याच्या पृष्ठभागावर गॅस साचून स्फोट होऊ नये म्हणून अग्निशामक पथक विशेष तंत्रज्ञानाने सुरक्षितता करते.'
    }
  },
  {
    id: 'shelter',
    titleKey: 'situation_shelter',
    recommendedNumber: '1070 (Relief Desk) or Rakshak AI Safe Routes',
    serviceName: {
      en: 'District Relief Camp Allocation Desk',
      hi: 'जिला राहत शिविर आवंटन डेस्क',
      mr: 'जिल्हा मदत शिबिर समन्वय कक्ष'
    },
    script: {
      en: '"Family of [Number] displaced by water in [Ward]. Need safe transit to nearest active relief camp with dry shelter and rations."',
      hi: '"[वार्ड] में बाढ़ से विस्थापित [संख्या] लोगों का परिवार। निकटतम सक्रिय राहत शिविर में सुरक्षित आश्रय चाहिए।"',
      mr: '"[प्रभाग] मधील पुरामुळे विस्थापित झालेले [संख्या] लोक. जवळच्या कोरड्या मदत शिबिरात जागा व अन्न हवे आहे."'
    },
    haveReady: {
      en: 'Current location, any special dietary/infant milk needs, mobility constraints.',
      hi: 'वर्तमान स्थान, नवजात शिशु के लिए दूध या विशेष आवश्यकताएं, चलने में असमर्थता।',
      mr: 'सध्याचे स्थान, लहान मुलांसाठी दूध, हालचालीस अडचण.'
    },
    why: {
      en: 'Provides live verification of shelter capacity and dispatches community bus shuttles on unflooded roads.',
      hi: 'शिविरों में बची हुई क्षमता की पुष्टि करता है और सूखे रास्तों से बस सेवा भेजता है।',
      mr: 'शिबिरांमधील शिल्लक जागेची माहिती देते आणि सुरक्षित मार्गावरून गाडीची सोय करते.'
    }
  }
];
