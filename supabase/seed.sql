-- Seed data for Rivergate Flood Response

INSERT INTO public.wards (id, number, name, name_hi, name_mr, elevation, population, vulnerable_population, drain_capacity, distance_to_river, centroid_x, centroid_y, polygon_points)
VALUES
  ('ward-1', 1, 'Riverside Promenade', 'रिवरसाइड प्रोमेनेड', 'रिव्हरसाइड प्रोमेनेड', 4.20, 14200, 2100, 35, 60, 170, 160, '70,70 190,80 230,220 120,240 60,160'),
  ('ward-2', 2, 'Old Fort Bazaar', 'पुराना किला बाज़ार', 'जुना किल्ला बाजार', 6.80, 22500, 4800, 28, 140, 260, 180, '190,80 340,90 350,220 230,220'),
  ('ward-3', 3, 'Fishermen Wharf', 'मछुआरों की बस्ती (घाट)', 'कोळीवाडा बंदर', 3.10, 9800, 2400, 20, 20, 190, 310, '120,240 230,220 280,340 180,380 90,320'),
  ('ward-4', 4, 'Mill Gate Industrial', 'मिल गेट औद्योगिक क्षेत्र', 'मिल गेट औद्योगिक वसाहत', 5.40, 16400, 2900, 42, 180, 310, 310, '230,220 350,220 380,350 280,340'),
  ('ward-5', 5, 'Greenfield Heights', 'ग्रीनफील्ड हाइट्स', 'ग्रीनफिल्ड हाइट्स', 18.50, 28000, 3100, 85, 1100, 670, 180, '570,70 760,80 770,250 590,240'),
  ('ward-6', 6, 'Civil Lines North', 'सिविल लाइन्स उत्तर', 'सिव्हिल लाइन्स उत्तर', 12.00, 19200, 2200, 65, 650, 470, 140, '340,90 570,70 590,240 460,230 350,220'),
  ('ward-7', 7, 'Station Colony', 'स्टेशन कॉलोनी', 'स्टेशन कॉलनी', 7.50, 24000, 3900, 38, 340, 450, 310, '350,220 460,230 520,360 380,350'),
  ('ward-8', 8, 'Highridge University', 'हाईरिज विश्वविद्यालय परिसर', 'हायरीज विद्यापीठ परिसर', 24.00, 15000, 1100, 90, 1400, 680, 340, '590,240 770,250 780,410 580,410'),
  ('ward-9', 9, 'South Canal Bridge', 'दक्षिण नहर पुल क्षेत्र', 'दक्षिण कालवा पूल परिसर', 4.90, 17600, 3300, 30, 110, 260, 460, '180,380 280,340 370,440 280,560 160,500'),
  ('ward-10', 10, 'Lakeside Enclave', 'लेकसाइड एन्क्लेव', 'लेकसाइड एन्क्लेव्ह', 8.20, 18300, 2500, 52, 480, 390, 460, '280,340 380,350 490,460 370,440'),
  ('ward-11', 11, 'Subhash Nagar', 'सुभाष नगर', 'सुभाष नगर', 10.40, 21100, 2700, 58, 720, 520, 460, '380,350 520,360 610,500 490,460'),
  ('ward-12', 12, 'East Gateway Park', 'ईस्ट गेटवे पार्क', 'पूर्व प्रवेशद्वार पार्क', 15.10, 16800, 1800, 78, 950, 670, 490, '580,410 780,410 760,570 590,560')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.camps (id, code, name, name_hi, name_mr, ward_id, coord_x, coord_y, total_capacity, current_occupancy, food_packets, drinking_water_liters, medical_kits)
VALUES
  ('camp-b', 'CAMP-B', 'Greenfield Stadium Shelter', 'ग्रीनफील्ड स्टेडियम राहत शिविर', 'ग्रीनफिल्ड स्टेडियम मदत शिबिर', 'ward-5', 670, 180, 1800, 740, 3200, 9500, 140),
  ('camp-a', 'CAMP-A', 'Highridge Campus Arena', 'हाईरिज कैंपस एरेना आश्रय', 'हायरीज कॅम्पस आश्रय शिबिर', 'ward-8', 680, 340, 1200, 410, 2400, 7200, 95),
  ('camp-c', 'CAMP-C', 'East Gate Polytechnic Center', 'ईस्ट गेट पॉलिटेक्निक केंद्र', 'पूर्व प्रवेशद्वार तंत्रनिकेतन केंद्र', 'ward-12', 670, 490, 1000, 280, 1900, 5800, 80),
  ('camp-d', 'CAMP-D', 'North Civil Community Hall', 'सिविल लाइन्स सामुदायिक भवन', 'सिव्हिल लाइन्स समाज मंदिर', 'ward-6', 470, 140, 800, 530, 1100, 3400, 60)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.alerts (severity, message_en, message_hi, message_mr, affected_ward_id)
VALUES
  ('warning', 'Red alert: Rivergate upstream dam discharge commenced at 01:30 AM. Low-lying riverfront wards prepare for controlled evacuation.', 'रेड अलर्ट: रिवरगेट अपस्ट्रीम बांध से 01:30 बजे पानी छोड़ा गया। निचले इलाकों में निकासी की तैयारी करें।', 'रेड अलर्ट: रिव्हरगेट धरणातून रात्री १:३० वाजता विसर्ग सुरू झाला आहे. सखल भागातील नागरिकांनी स्थलांतराची तयारी ठेवावी.', 'ward-3'),
  ('critical', 'Flash flood warning issued for Ward 3 (Fishermen Wharf) & Ward 1 (Riverside Promenade). Move to Greenfield Stadium Shelter.', 'वार्ड 3 और वार्ड 1 के लिए त्वरित बाढ़ चेतावनी जारी। ग्रीनफील्ड स्टेडियम राहत शिविर में जाएं।', 'प्रभाग ३ व प्रभाग १ साठी तीव्र पुराचा इशारा. ग्रीनफिल्ड स्टेडियम मदत शिबिराकडे त्वरित जावे.', 'ward-1');

INSERT INTO public.weather_snapshots (rainfall_mm, river_level, source)
VALUES
  (140.0, 2.80, 'open-meteo-sensor-mesh');
