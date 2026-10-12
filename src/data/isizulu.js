// isiZulu course. Same item format as siswati.js.
// No public-domain Zulu course text was supplied, so items are marked 'ai'
// (general knowledge, not yet checked by a speaker) unless they come from the
// handbook's siSwati–Zulu comparison ('hb').

export default {
  id: 'zu',
  name: 'isiZulu',
  native: 'isiZulu',
  accent: '#1f8a4c',
  accent2: '#f2b705',
  cousinOf: 'ss',
  sounds: [
    ['a e i o u', 'pure vowels: car, bed, eat, post, roof', 'sawubona'],
    ['c', 'click: the "tut-tut" of disapproval. Tongue tip pulls off the back of the top teeth.', 'cela (ask), icici (earring)'],
    ['q', 'click: tongue snaps down from the roof of the mouth, like a cork popping', 'iqanda (egg)'],
    ['x', 'click: from the side of the tongue, like urging on a horse', 'xoxa (chat), uxolo (sorry)'],
    ['ch / qh / xh', 'the same three clicks with a puff of air', 'ichibi (pond), qhubeka (continue)'],
    ['gc / gq / gx', 'the same three clicks, voiced (a "g" sound in them)', 'gqoka (wear), gcina (keep)'],
    ['nc / nq / nx', 'the same three clicks, nasal', 'ncane (small), inqola (cart)'],
    ['hl', 'like Welsh "ll": blow air past the sides of the tongue', 'hlala (sit), hlanu (five)'],
    ['dl', 'the voiced partner of "hl"', 'ukudla (food)'],
    ['th', 'NOT English "th". It\'s a "t" with a puff of air', 'thatha (take), thula (be quiet)'],
    ['ph / kh', 'p and k with a puff of air', 'phansi (down), khuluma (speak)'],
    ['p / t / k', 'no puff of air. "k" can sound almost like a "g"', 'ukukhuluma, kakhulu'],
    ['bh / b', 'bh is a normal English b; b is "implosive", swallowed slightly inward', 'bhala (write), baba (father)'],
    ['hh', 'a breathy, voiced h', 'hhayi (no)'],
    ['ng', 'as in "finger" between vowels', 'ngiyabonga'],
    ['tones', 'Zulu is tonal; stress usually falls on the second-to-last syllable', ''],
  ],
  units: [
    {
      id: 'zu-u1', title: 'First words',
      desc: 'Yes, no, hello and thank you, plus the three clicks.',
      tip: 'Zulu has three clicks: c, q and x. They are ordinary consonants, so don\'t pause before them. Stress usually falls on the second-to-last syllable: sa-wu-BO-na.',
      lessons: [
        {
          id: 'zu-1-1', title: 'Yes & no', src: 'ai', items: [
            ['Yebo', 'Yes', { note: 'Also the standard reply to Sawubona.' }],
            ['Cha', 'No', { ta: ['Hhayi'], note: '"ch" is the c-click with a puff of air.' }],
            ['Sawubona', 'Hello', { alt: ['Hi'], note: 'To one person. Literally "I see you".' }],
            ['Ngiyabonga', 'Thank you', { alt: ['Thanks'] }],
            ['Ngicela', 'Please', { alt: ['I ask', 'May I have'], note: 'Literally "I ask for".' }],
            ['Kulungile', "It's okay", { alt: ["It's fine", 'Okay', 'Alright', 'It is okay'] }],
          ],
        },
        {
          id: 'zu-1-2', title: 'Click practice', src: 'ai', items: [
            ['Uxolo', 'Sorry', { alt: ['Excuse me', 'Peace'], note: 'x-click. Also means "peace".' }],
            ['Iqanda', 'Egg', { note: 'q-click: the cork pop.' }],
            ['Cela', 'Ask', { alt: ['Ask for', 'Request'], note: 'c-click: the tut-tut.' }],
            ['Xoxa', 'Chat', { alt: ['Talk', 'Converse', 'Tell'], note: 'Two x-clicks!' }],
            ['Ukudla', 'Food', { alt: ['To eat', 'Eat'] }],
            ['Khuluma', 'Speak', { alt: ['Talk'] }],
            ['Hamba', 'Go', { alt: ['Walk', 'Leave'] }],
          ],
        },
      ],
    },
    {
      id: 'zu-u2', title: 'Greetings',
      desc: 'Greet people, ask their name, say goodbye.',
      tip: 'Greet before anything else, and use titles for respect: "Sawubona mama", "Sawubona baba". With friends you\'ll also hear "Sho!" and "Unjani?". Notice how close siSwati is: the greeting is the same word.',
      lessons: [
        {
          id: 'zu-2-1', title: 'Hello', src: 'ai', items: [
            ['Sawubona', 'Hello', { alt: ['Hi'], note: 'To one person.' }],
            ['Sanibonani', 'Hello everyone', { alt: ['Hello (plural)', 'Hello all'], note: 'To two or more people.' }],
            ['Unjani?', 'How are you?', {}],
            ['Ninjani?', 'How are you all?', { alt: ['How are you? (plural)'] }],
            ['Ngiyaphila', 'I am well', { alt: ["I'm well", 'I am fine', "I'm fine"] }],
            ['Sikhona', 'We are fine', { alt: ["We're fine", 'We are here'] }],
            ['Ngikhona', 'I am fine', { alt: ["I'm fine", 'I am here'] }],
          ],
        },
        {
          id: 'zu-2-2', title: 'And you?', src: 'ai', items: [
            ['Wena unjani?', 'And you, how are you?', { alt: ['And you?', 'How are you?'] }],
            ['Nami ngiyaphila', 'I am also well', { alt: ["I'm well too", 'I am well too', 'Me too'] }],
            ['Nami futhi', 'Me too', { alt: ['Me also', 'I also'], note: 'siSwati: Nami futsi (th → ts).' }],
            ['Ngiyaphila, wena unjani?', 'I am well, how are you?', { alt: ["I'm fine, and you?", 'I am well, and you?'] }],
            ['Sawubona mngane', 'Hello friend', { alt: ['Hello my friend'] }],
          ],
        },
        {
          id: 'zu-2-3', title: 'Names', src: 'ai', items: [
            ['Igama', 'Name', { note: 'siSwati: ligama.' }],
            ['Ngubani igama lakho?', 'What is your name?', { alt: ["What's your name?"] }],
            ['Igama lami ngu...', 'My name is...', { alt: ['My name is'] }],
            ['Ngubani igama lakhe?', 'What is his name?', { alt: ['What is her name?', 'What is his/her name?'] }],
            ['Ngiyajabula ukukwazi', 'I am happy to know you', { alt: ['Pleased to meet you', 'Nice to meet you'], note: 'siSwati: Ngiyajabula kukwati (z → t).' }],
            ['Wamukelekile', 'You are welcome', { alt: ["You're welcome", 'Welcome'] }],
          ],
        },
        {
          id: 'zu-2-4', title: 'Goodbye', src: 'ai', items: [
            ['Sala kahle', 'Stay well', { alt: ['Goodbye', 'Bye'], note: 'Said by the person LEAVING.' }],
            ['Hamba kahle', 'Go well', { alt: ['Goodbye', 'Bye'], note: 'Said by the person STAYING.' }],
            ['Sobonana', 'See you', { alt: ['See you later', 'We will see each other'] }],
            ['Ngivela eNingizimu Afrika', 'I come from South Africa', { alt: ["I'm from South Africa", 'I am from South Africa'] }],
            ['Ngihlala eGoli', 'I live in Johannesburg', { alt: ['I stay in Johannesburg', 'I live in Joburg'] }],
          ],
        },
      ],
    },
    {
      id: 'zu-u3', title: 'How are you?',
      desc: 'Talk about how you feel and your health.',
      tip: '"Ngi-" means "I". To make a verb negative, use a-…-i: ngiyaphila (I am well) → angiphili (I am not well). Ngiyaxolisa is a heartfelt apology; uxolo is "excuse me / sorry".',
      lessons: [
        {
          id: 'zu-3-1', title: 'Feelings', src: 'ai', items: [
            ['Ngijabulile', 'I am happy', { alt: ["I'm happy"] }],
            ['Ngikhathele', 'I am tired', { alt: ["I'm tired"], note: 'siSwati uses a different word: ngidziniwe.' }],
            ['Kuhle', 'Good', { alt: ['It is good', "That's good", 'That is good'] }],
            ['Namuhla', 'Today', { ta: ['Namhlanje'] }],
            ['Unjani namuhla?', 'How are you today?', {}],
            ['Kakhulu', 'Very much', { alt: ['Very', 'A lot'] }],
          ],
        },
        {
          id: 'zu-3-2', title: 'Not so well', src: 'ai', items: [
            ['Angiphili', 'I am not well', { alt: ["I'm not well", 'I am unwell'] }],
            ['Ngiyagula', 'I am sick', { alt: ["I'm sick", 'I am ill'] }],
            ['Nginomkhuhlane', 'I have flu', { alt: ['I have a cold', 'I have the flu'] }],
            ['Uyagula?', 'Are you sick?', { alt: ['You are sick?'] }],
            ['Ngiyaxolisa', 'I apologise', { alt: ['I apologize', "I'm sorry", 'I am sorry'] }],
            ['Ngiyezwa', 'I understand', { alt: ['I hear', 'I hear you', 'I feel'] }],
          ],
        },
      ],
    },
    {
      id: 'zu-u4', title: 'Family',
      desc: 'Family members, plus "I have" and "I don\'t have".',
      tip: 'Zulu nouns usually carry a prefix vowel: u-baba, u-mama, i-ngane. siSwati often drops it (babe, make). "I have" is ngi-na-/ngi-ne-/ngi-no- + noun, merging with the noun\'s first vowel: na + umama → nginomama.',
      lessons: [
        {
          id: 'zu-4-1', title: 'Parents & siblings', src: 'ai', items: [
            ['Umndeni', 'Family', {}],
            ['Ubaba', 'Father', { alt: ['Dad'] }],
            ['Umama', 'Mother', { alt: ['Mom', 'Mum'] }],
            ['Ubhuti', 'Brother', { alt: ['Older brother'] }],
            ['Usisi', 'Sister', { alt: ['Older sister'] }],
            ['Ugogo', 'Grandmother', { alt: ['Granny', 'Grandma'] }],
            ['Umkhulu', 'Grandfather', { alt: ['Grandpa'] }],
          ],
        },
        {
          id: 'zu-4-2', title: 'Children & partners', src: 'ai', items: [
            ['Ingane', 'Child', { ta: ['Umntwana'] }],
            ['Indodana', 'Son', { note: 'siSwati: indvodzana (d → dv/dz).', src: 'hb' }],
            ['Indodakazi', 'Daughter', { note: 'siSwati: indvodzakati.', src: 'hb' }],
            ['Indoda', 'Man', { alt: ['Husband'], src: 'hb' }],
            ['Umyeni', 'Husband', {}],
            ['Unkosikazi', 'Wife', { alt: ['Mrs', 'Madam'] }],
            ['Umngane', 'Friend', {}],
          ],
        },
        {
          id: 'zu-4-3', title: 'I have…', src: 'ai', items: [
            ['Nginomndeni', 'I have a family', {}],
            ['Nginobaba', 'I have a father', {}],
            ['Nginomama', 'I have a mother', {}],
            ['Nginodadewethu', 'I have a sister', { note: 'Udadewethu: "our sister", from a brother\'s point of view.' }],
            ['Nginengane', 'I have a child', {}],
            ['Anginayo ingane', "I don't have a child", { alt: ['I do not have a child'] }],
          ],
        },
      ],
    },
    {
      id: 'zu-u5', title: 'Useful expressions',
      desc: 'Phrases you\'ll use every day.',
      tip: '"Ngicela…" (please / may I have) goes in front of whatever you want: Ngicela amanzi (water, please), Ngicela uphinde (please repeat).',
      lessons: [
        {
          id: 'zu-5-1', title: 'Polite words', src: 'ai', items: [
            ['Uxolo', 'Excuse me', { alt: ['Sorry'] }],
            ['Ayikho inkinga', 'No problem', { alt: ["There's no problem"], note: 'siSwati: kute inkinga.' }],
            ['Kulungile', "It's okay", { alt: ['Okay', "It's fine", 'Alright'] }],
            ['Ngiyabonga kakhulu', 'Thank you very much', { alt: ['Thanks a lot', 'Thank you so much'] }],
            ['Wamukelekile', 'You are welcome', { alt: ["You're welcome"] }],
          ],
        },
        {
          id: 'zu-5-2', title: 'Here & now', src: 'ai', items: [
            ['Lapha', 'Here', {}],
            ['Lapho', 'There', {}],
            ['Manje', 'Now', { note: 'siSwati: nyalo.' }],
            ['Kamuva', 'Later', { alt: ['Afterwards'] }],
            ['Njalo', 'Always', { alt: ['Often'] }],
            ['Hhayi bo!', 'No way!', { alt: ['Come on!', 'Oh no!'] }],
          ],
        },
        {
          id: 'zu-5-3', title: 'Learner survival', src: 'ai', items: [
            ['Angazi', "I don't know", { alt: ['I do not know'], note: 'siSwati: angati (z → t).' }],
            ['Ngiyaqonda', 'I understand', {}],
            ['Angiqondi', "I don't understand", { alt: ['I do not understand'] }],
            ['Ngicela uphinde', 'Please repeat', { alt: ['Repeat please', 'Repeat, please'] }],
            ['Khuluma kancane', 'Speak slowly', { alt: ['Talk slowly', 'Speak slowly please'] }],
            ['Kancane', 'Slowly', { alt: ['A little'] }],
          ],
        },
      ],
    },
    {
      id: 'zu-u6', title: 'Food & drink',
      desc: 'Order food, say you\'re hungry, praise the cooking.',
      tip: 'Zulu nouns keep their full prefix (isi-nkwa, ama-nzi, u-bisi), while siSwati shortens many (si-nkhwa, ema-nti, lu-bisi). Compare amanzi ↔ emanti: Zulu z becomes siSwati t.',
      lessons: [
        {
          id: 'zu-6-1', title: 'Drinks', src: 'ai', items: [
            ['Amanzi', 'Water', {}],
            ['Itiye', 'Tea', {}],
            ['Ikhofi', 'Coffee', {}],
            ['Ubisi', 'Milk', {}],
            ['Ijusi', 'Juice', {}],
            ['Ushukela', 'Sugar', {}],
            ['Ngomile', 'I am thirsty', { alt: ["I'm thirsty"] }],
          ],
        },
        {
          id: 'zu-6-2', title: 'Food', src: 'ai', items: [
            ['Isinkwa', 'Bread', {}],
            ['Irayisi', 'Rice', {}],
            ['Usawoti', 'Salt', {}],
            ['Imifino', 'Vegetables', { alt: ['Greens', 'Veggies'] }],
            ['Izithelo', 'Fruits', { alt: ['Fruit'] }],
            ['Inyama', 'Meat', {}],
            ['Iqanda', 'Egg', {}],
            ['Inhlanzi', 'Fish', {}],
            ['Iphalishi', 'Porridge', { alt: ['Pap'], ta: ['Ipapa'] }],
          ],
        },
        {
          id: 'zu-6-3', title: 'Mealtimes', src: 'ai', items: [
            ['Ngilambile', 'I am hungry', { alt: ["I'm hungry"] }],
            ['Ngisuthi', 'I am full', { alt: ["I'm full"] }],
            ['Kumnandi', 'It is delicious', { alt: ["It's delicious", 'It is nice', 'It is tasty', 'Delicious', 'Tasty'] }],
            ['Kumnandi kakhulu!', 'It is very delicious!', { alt: ["It's very tasty!", 'Very delicious!'] }],
            ['Ngicela amanzi', 'Water, please', { alt: ['May I have water?', 'Please give me water'] }],
            ['Ngifuna ukudla', 'I want food', { alt: ['I want to eat'] }],
            ['Ngiphuza itiye', 'I drink tea', { alt: ['I am drinking tea'] }],
          ],
        },
      ],
    },
    {
      id: 'zu-u7', title: 'Getting around',
      desc: 'Taxis, shops and directions.',
      tip: 'Locative "at / to / in": e- + noun + -ini. Isitolo → esitolo, iposi → eposini, idolobha → edolobheni. Place names take e-/kwa- too: eGoli (in Johannesburg), eThekwini (in Durban).',
      lessons: [
        {
          id: 'zu-7-1', title: 'Taking a taxi', src: 'ai', items: [
            ['Iyaphi?', 'Where is it going?', { alt: ['Where does it go?'] }],
            ['Isuka nini?', 'When is it leaving?', { alt: ['When does it leave?'] }],
            ['Malini?', 'How much?', { alt: ['How much is it?'] }],
            ['Ngicela ushintshi', 'Change please', { alt: ['My change, please', 'Change, please'] }],
            ['Esiteshini', 'At the station', { alt: ['To the station'] }],
            ['Ngehla lapha', 'Drop me here', { alt: ['I get off here', 'Stop here'], note: 'Literally "I get off here". Very useful in a taxi.' }],
          ],
        },
        {
          id: 'zu-7-2', title: 'Directions', src: 'ai', items: [
            ['Ngakwesobunxele', 'On the left', { alt: ['Left', 'To the left'] }],
            ['Ngakwesokudla', 'On the right', { alt: ['Right', 'To the right'] }],
            ['Eduze', 'Near', { alt: ['Nearby', 'Close'] }],
            ['Kude', 'Far', {}],
            ['Phezulu', 'Up', { alt: ['Above', 'On top'] }],
            ['Phansi', 'Down', { alt: ['Below'] }],
            ['Ikuphi?', 'Where is it?', {}],
          ],
        },
        {
          id: 'zu-7-3', title: 'In town', src: 'ai', items: [
            ['Isitolo', 'Shop', { alt: ['Store'] }],
            ['Esitolo', 'At the shop', { alt: ['To the shop'] }],
            ['Eposini', 'At the post office', { alt: ['To the post office'] }],
            ['Idolobha', 'Town', {}],
            ['Edolobheni', 'In town', { alt: ['To town'] }],
            ['Iphi indlu yangasese?', 'Where is the toilet?', { alt: ['Where is the bathroom?'] }],
          ],
        },
      ],
    },
    {
      id: 'zu-u8', title: 'Time & days',
      desc: 'Today, tomorrow, parts of the day, days of the week.',
      tip: 'The days from Tuesday to Friday are numbered: uLwesi-bili (2nd), uLwesi-thathu (3rd), uLwesi-ne (4th), uLwesi-hlanu (5th). iSonto means both Sunday and church.',
      lessons: [
        {
          id: 'zu-8-1', title: 'Yesterday & tomorrow', src: 'ai', items: [
            ['Namuhla', 'Today', { ta: ['Namhlanje'] }],
            ['Izolo', 'Yesterday', { note: 'siSwati: itolo.' }],
            ['Kusasa', 'Tomorrow', {}],
            ['Isikhathi', 'Time', { note: 'siSwati: sikhatsi (th → ts).' }],
            ['Iviki', 'Week', { ta: ['Isonto'] }],
            ['Inyanga', 'Month', { alt: ['Moon'] }],
            ['Unyaka', 'Year', {}],
          ],
        },
        {
          id: 'zu-8-2', title: 'Parts of the day', src: 'ai', items: [
            ['Ekuseni', 'In the morning', { alt: ['Morning'] }],
            ['Emini', 'At noon', { alt: ['Midday', 'At midday'] }],
            ['Ntambama', 'In the afternoon', { alt: ['Afternoon'] }],
            ['Kusihlwa', 'In the evening', { alt: ['Evening'] }],
            ['Ebusuku', 'At night', { alt: ['Night'] }],
          ],
        },
        {
          id: 'zu-8-3', title: 'Days of the week', src: 'ai', items: [
            ['uMsombuluko', 'Monday', {}],
            ['uLwesibili', 'Tuesday', {}],
            ['uLwesithathu', 'Wednesday', {}],
            ['uLwesine', 'Thursday', {}],
            ['uLwesihlanu', 'Friday', {}],
            ['uMgqibelo', 'Saturday', {}],
            ['iSonto', 'Sunday', {}],
          ],
        },
      ],
    },
    {
      id: 'zu-u9', title: 'Numbers',
      desc: 'Count from one to ten.',
      tip: 'Eight and nine mean "leave two fingers" (isishiyagalombili) and "leave one finger" (isishiyagalolunye). Day to day, many people also count in English.',
      lessons: [
        {
          id: 'zu-9-1', title: 'One to five', src: 'ai', items: [
            ['Kunye', 'One', { alt: ['1'] }],
            ['Kubili', 'Two', { alt: ['2'] }],
            ['Kuthathu', 'Three', { alt: ['3'], note: 'siSwati: kutsatfu.' }],
            ['Kune', 'Four', { alt: ['4'] }],
            ['Kuhlanu', 'Five', { alt: ['5'] }],
          ],
        },
        {
          id: 'zu-9-2', title: 'Six to ten', src: 'ai', items: [
            ['Isithupha', 'Six', { alt: ['6'], note: 'Also means "thumb".' }],
            ['Isikhombisa', 'Seven', { alt: ['7'], note: 'From "khomba", to point (the pointing finger).', src: 'hb' }],
            ['Isishiyagalombili', 'Eight', { alt: ['8'] }],
            ['Isishiyagalolunye', 'Nine', { alt: ['9'] }],
            ['Ishumi', 'Ten', { alt: ['10'] }],
          ],
        },
      ],
    },
    {
      id: 'zu-u10', title: 'Building sentences',
      desc: 'Verbs and the "I / you / we" prefixes: your first real sentences.',
      tip: 'Subject prefixes: ngi- (I), u- (you), u-/u- (he/she), si- (we), ni- (you all), ba- (they). Use -ya- when the verb ends the sentence: Ngiyafunda (I am learning), but Ngifunda isiZulu. Negative: a-…-i → angifuni (I don\'t want).',
      lessons: [
        {
          id: 'zu-10-1', title: 'Action words', src: 'ai', items: [
            ['Ukuhamba', 'To go', { alt: ['To walk', 'Go', 'Walk'] }],
            ['Ukudla', 'To eat', { alt: ['Eat', 'Food'] }],
            ['Ukuphuza', 'To drink', { alt: ['Drink'], note: 'siSwati uses -natsa.', src: 'hb' }],
            ['Ukufunda', 'To learn', { alt: ['To read', 'To study', 'Learn', 'Read'] }],
            ['Ukukhuluma', 'To speak', { alt: ['To talk', 'Speak'] }],
            ['Ukubona', 'To see', { alt: ['See'] }],
            ['Ukufuna', 'To want', { alt: ['Want'] }],
            ['Ukusebenza', 'To work', { alt: ['Work'] }],
          ],
        },
        {
          id: 'zu-10-2', title: 'I am learning', src: 'ai', items: [
            ['Ngiyafunda', 'I am learning', { alt: ["I'm learning", 'I am studying', 'I am reading'] }],
            ['Ngifunda isiZulu', 'I am learning isiZulu', { alt: ["I'm learning isiZulu", 'I learn Zulu', 'I am learning Zulu'] }],
            ['Ngikhuluma isiZulu kancane', 'I speak a little isiZulu', { alt: ['I speak a little Zulu', 'I speak isiZulu a little'] }],
            ['Uyasikhuluma isiZulu?', 'Do you speak isiZulu?', { alt: ['Do you speak Zulu?', 'Can you speak Zulu?'] }],
            ['Ngifuna ukufunda', 'I want to learn', { alt: ['I want to study', 'I want to read'] }],
            ['Ngiyasebenza', 'I am working', { alt: ["I'm working", 'I work'] }],
          ],
        },
        {
          id: 'zu-10-3', title: 'Saying no', src: 'ai', items: [
            ['Angifuni', "I don't want", { alt: ['I do not want'] }],
            ['Angiboni', "I don't see", { alt: ['I do not see', "I can't see"] }],
            ['Angazi', "I don't know", { alt: ['I do not know'] }],
            ['Angikhulumi isiZulu', "I don't speak isiZulu", { alt: ["I don't speak Zulu", 'I do not speak isiZulu'] }],
            ['Angiqondi', "I don't understand", { alt: ['I do not understand'] }],
          ],
        },
      ],
    },
    {
      id: 'zu-u11', title: 'Animals & nature',
      desc: 'Cattle, wildlife, the sky and the land.',
      tip: 'Cattle (izinkomo) are central to Zulu culture, used for lobola, ceremonies and wealth. Plural "izin-" in Zulu becomes "tin-" in siSwati: izinkomo ↔ tinkhomo.',
      lessons: [
        {
          id: 'zu-11-1', title: 'At home', src: 'ai', items: [
            ['Inkomo', 'Cow', { alt: ['Cattle', 'Ox'] }],
            ['Imbuzi', 'Goat', { note: 'siSwati: imbuti (z → t).' }],
            ['Imvu', 'Sheep', {}],
            ['Inkukhu', 'Chicken', { alt: ['Hen'] }],
            ['Ikati', 'Cat', {}],
            ['Inja', 'Dog', {}],
          ],
        },
        {
          id: 'zu-11-2', title: 'In the wild', src: 'ai', items: [
            ['Inyoni', 'Bird', {}],
            ['Inyoka', 'Snake', {}],
            ['Ingwenya', 'Crocodile', {}],
            ['Imvubu', 'Hippo', { alt: ['Hippopotamus'] }],
            ['Ibhubesi', 'Lion', {}],
            ['Indlovu', 'Elephant', {}],
          ],
        },
        {
          id: 'zu-11-3', title: 'Sky & land', src: 'ai', items: [
            ['Ilanga', 'Sun', { alt: ['Day'] }],
            ['Inyanga', 'Moon', { alt: ['Month'] }],
            ['Imvula', 'Rain', {}],
            ['Isihlahla', 'Tree', {}],
            ['Itshe', 'Stone', { alt: ['Rock'] }],
            ['Intaba', 'Mountain', {}],
          ],
        },
      ],
    },
    {
      id: 'zu-u12', title: 'Respect & culture',
      desc: 'Ukuhlonipha: greeting and addressing people with respect.',
      tip: 'Ukuhlonipha (respect) shapes everyday behaviour: greet first, use titles, receive things with both hands or the right hand, and avoid direct eye contact with elders when they\'re correcting you.',
      lessons: [
        {
          id: 'zu-12-1', title: 'Greeting with respect', src: 'ai', items: [
            ['Sawubona mama', 'Hello mother', { alt: ["Hello ma'am", 'Hello madam'], note: 'To any older woman.' }],
            ['Sawubona baba', 'Hello father', { alt: ['Hello sir'], note: 'To any older man.' }],
            ['Sawubona gogo', 'Hello grandmother', { alt: ['Hello granny'] }],
            ['Sanibonani bakwethu', 'Hello my people', { alt: ['Hello everyone', 'Hello friends'] }],
            ['Ngiyabonga kakhulu', 'Thank you very much', { alt: ['Thanks a lot'] }],
          ],
        },
      ],
    },
  ],

  proverbs: [
    { t: 'Umuntu ngumuntu ngabantu', lit: 'A person is a person through people', meaning: 'Ubuntu: our humanity is realised through our relationships with others.', reflect: 'Who made you who you are?', src: 'ai' },
    { t: 'Izandla ziyagezana', lit: 'Hands wash each other', meaning: 'People must help one another (siSwati: Tandla tiyagezana).', reflect: 'Whose hands are you washing?', src: 'ai' },
    { t: 'Inkunzi isematholeni', lit: 'The bull is among the calves', meaning: 'Future greatness is hidden in the young. Don\'t underestimate youth.', reflect: 'Which young person could you invest in?', src: 'ai' },
    { t: 'Indlela ibuzwa kwabaphambili', lit: 'The way is asked from those who have gone ahead', meaning: 'Seek guidance from those with experience.', reflect: 'Who has walked the road you are on now?', src: 'ai' },
    { t: 'Akukho qili lazikhotha emhlane', lit: 'No clever one ever licked their own back', meaning: 'No matter how capable you are, you still need others.', reflect: 'Where are you refusing help you need?', src: 'ai' },
    { t: 'Kancane kancane inyoni yakha isidleke sayo', lit: 'Little by little the bird builds its nest', meaning: 'Patience and steady effort get things done, like learning a language.', reflect: 'What twig will you add today?', src: 'ai' },
    { t: 'Umthente uhlaba usamila', lit: 'The thorn pricks while it is still growing', meaning: 'Talent shows itself early.', reflect: 'What did you love doing as a child?', src: 'ai' },
    { t: 'Isisu somhambi asingakanani', lit: 'A traveller\'s stomach is not big', meaning: 'Always feed a traveller; hospitality is a duty (the same proverb exists in siSwati).', reflect: 'Who is the traveller at your door?', src: 'ai' },
    { t: 'Ithemba alibulali', lit: 'Hope does not kill', meaning: 'Keep hoping (siSwati: Litsemba alibulali).', reflect: 'What are you still hoping for?', src: 'ai' },
    { t: 'Induku enhle igawulwa ezizweni', lit: 'A good stick is cut in foreign lands', meaning: 'Good things (often a spouse) may come from far away. Look beyond your own circle.', reflect: 'What good thing came to you from far away?', src: 'ai' },
    { t: 'Inja ekhonkothayo ayilumi', lit: 'A barking dog does not bite', meaning: 'Those who make the most noise are rarely the real danger.', reflect: 'Which loud fear is all bark?', src: 'ai' },
    { t: 'Ukuzala ukuzelula', lit: 'To give birth is to stretch yourself', meaning: 'Raising children is an investment: they will support you in turn.', reflect: 'What are you raising that will one day carry you?', src: 'ai' },
  ],

  concepts: [
    { t: 'uMvelinqangi', en: 'The First to Appear', body: 'The Zulu name for the Creator, "the one who came out first", who made all things. Also called uNkulunkulu, "the great-great one".', src: 'ai' },
    { t: 'uNkulunkulu', en: 'The Great One / God', body: 'Originally the first ancestor and creator figure in Zulu thought; later used for God in Christian Zulu. A good example of how theology lives inside language.', src: 'ai' },
    { t: 'Amadlozi', en: 'The ancestors', body: 'Ancestral spirits who protect and guide their descendants, and are honoured through ritual (ukuthetha amadlozi: speaking to the ancestors). The siSwati equivalent is emadloti.', src: 'ai' },
    { t: 'Ubuntu', en: 'Humanity', body: 'Personhood is relational: "umuntu ngumuntu ngabantu". It\'s the ethical heart of Nguni philosophy, about dignity, compassion and community.', src: 'ai' },
    { t: 'Ukuhlonipha', en: 'Respect', body: 'A system of respect in behaviour and speech. Married women traditionally avoid saying the names of their in-laws (isihlonipho), even replacing syllables in ordinary words.', src: 'ai' },
    { t: 'Izibongo', en: 'Praise poetry', body: 'Oral praise poems recited by an imbongi (praise poet) for kings, clans and individuals, full of metaphor, history and lineage. Every Zulu clan name (isibongo) comes with its own praises.', src: 'ai' },
  ],

  culture: [
    'Greet first, always, even strangers. "Sawubona" literally means "I see you", and the reply "Yebo" means "Yes (I see you too)".',
    'Older people are mama and baba even if you\'ve never met them.',
    'Receive gifts and food with both hands, or with your right hand supported by your left at the wrist.',
    'Avoid looking an elder straight in the eye while they speak to you seriously. It can come across as defiance.',
    'Your surname (isibongo) has praises (izibongo). Asking someone\'s clan name is a warm way to connect.',
    'Ukuhlonipha (respect) is shown in language too: there are special respect words used toward in-laws.',
  ],
};
