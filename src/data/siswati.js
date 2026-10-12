// siSwati course.
// Item format: [target, English, extras?]
//   extras: { alt: [other accepted English], ta: [other accepted siSwati],
//             note, lit (literal meaning), meaning (proverbs), src }
// src: 'pc' = Peace Corps siSwati Language Lessons (audio course text)
//      'hb' = Peace Corps siSwati Special Skills Handbook (1980, ERIC ED294413)
//      'ai' = added from general knowledge, NOT yet checked by a speaker
// A lesson's src applies to all its items unless an item overrides it.

export default {
  id: 'ss',
  name: 'siSwati',
  native: 'siSwati',
  flag: '🇸🇿',
  accent: '#3e5eb9',
  accent2: '#ffd900',
  cousinOf: 'zu',
  sounds: [
    ['a', 'as in "car"', 'sawubona'],
    ['e', 'as in "bed"', 'yebo'],
    ['i', 'as in "eat"', 'unjani'],
    ['o', 'as in "post"', 'ngikhona'],
    ['u', 'as in "roof"', 'Unjani wena?'],
    ['tf', 'a "t" released straight into an "f" — siSwati\'s signature sound (Zulu has "th")', 'kutsatfu (three)'],
    ['dv', 'a "d" released into a "v"', 'indvodza (man / husband)'],
    ['dz', 'like the "ds" in "adds"', 'fundza (read, learn)'],
    ['ts', 'like the "ts" in "cats"', 'futsi (also)'],
    ['tj', 'like the "ch" in "church", softly', 'litje (stone)'],
    ['hl', 'like Welsh "ll": tongue on the roof of the mouth, blow air out the sides', 'hlola (check)'],
    ['dl', 'the voiced partner of "hl"', 'kudla (food)'],
    ['hh', 'a breathy "h" from the throat', 'hhula (cut hair)'],
    ['ph / th / kh', 'p, t, k with a puff of air', 'liphepha (paper), khuluma (speak)'],
    ['p / t / k', 'p, t, k with no puff of air (like in "spin")', 'lipalishi, situlo'],
    ['c', 'click: the "tut-tut" sound of disapproval', 'cela (ask)'],
    ['ch', 'the same "c" click with a puff of air', 'cha (no)'],
    ['gc', 'the same "c" click, voiced', 'ligciwane (virus)'],
    ['q', 'click: tongue snaps down from the roof of the mouth, like a cork pop (rare in siSwati)', 'chuba / qhuba (drive)'],
    ['ng', 'as in "sing", even at the start of a word', 'ngikhona'],
    ['tones', 'siSwati is tonal: pitch can change a word\'s meaning. Copy your teacher\'s melody, not only the letters.', ''],
  ],
  units: [
    {
      id: 'ss-u1', icon: '🌱', title: 'First words',
      desc: 'Yes, no, hello and thank you, plus your first sounds.',
      tip: 'In siSwati the stress usually falls on the second-to-last syllable: sa-wu-BO-na, ngi-ya-BO-nga. Words are spelled the way they sound, so once you know the letters you can read anything.',
      lessons: [
        {
          id: 'ss-1-1', title: 'Yes & no', src: 'pc', items: [
            ['Yebo', 'Yes', { note: 'Also the standard reply to Sawubona.' }],
            ['Cha', 'No', { note: '"ch" is the tut-tut click with a puff of air.' }],
            ['Sawubona', 'Hello', { alt: ['Hi'], note: 'To one person. Literally "I see you". Works at any time of day.' }],
            ['Ngiyabonga', 'Thank you', { alt: ['Thanks'] }],
            ['Ngiyacela', 'Please', { alt: ['I ask', 'Would you please'], note: 'Literally "I ask".' }],
            ['Kulungile', "It's okay", { alt: ["It's fine", 'Okay', 'Alright', 'It is okay'] }],
          ],
        },
        {
          id: 'ss-1-2', title: 'Sound check', src: 'pc', items: [
            ['Babe', 'Father', { alt: ['Dad', 'Sir'], note: 'Also a respectful way to address any older man.' }],
            ['Make', 'Mother', { alt: ['Mom', 'Mum', 'Madam'], note: 'Pronounced MA-ge. Also a respectful way to address any older woman.' }],
            ['Bhuti', 'Brother', { alt: ['Older brother'] }],
            ['Hamba', 'Go', { alt: ['Walk', 'Leave'] }],
            ['Khuluma', 'Speak', { alt: ['Talk'] }],
            ['Fundza', 'Read', { alt: ['Learn', 'Study'], note: '"dz" like the "ds" in "adds". Zulu: funda.' }],
            ['Kudla', 'Food', { note: '"dl" is the voiced partner of "hl".' }],
          ],
        },
      ],
    },
    {
      id: 'ss-u2', icon: '👋', title: 'Greetings',
      desc: 'Greet people, ask their name, say goodbye.',
      tip: 'Greeting comes before everything else. Starting a conversation (even asking for directions) without greeting first is seen as rude. Add a title for respect: "Sawubona make", "Sawubona babe".',
      lessons: [
        {
          id: 'ss-2-1', title: 'Hello', src: 'pc', items: [
            ['Sawubona', 'Hello', { alt: ['Hi'], note: 'To one person.' }],
            ['Sanibonani', 'Hello everyone', { alt: ['Hello (plural)', 'Hello all', 'Hello to many'], src: 'ai', note: 'To two or more people.' }],
            ['Kusile', 'Good morning', { lit: 'It has dawned' }],
            ['Unjani?', 'How are you?', { note: 'To one person.' }],
            ['Ninjani?', 'How are you all?', { alt: ['How are you? (plural)', 'How are you (plural)'], note: 'To two or more people.' }],
            ['Ngikhona', 'I am fine', { alt: ["I'm fine", 'I am well'], lit: 'I am here / present' }],
            ['Sikhona', 'We are fine', { alt: ["We're fine", 'We are well'] }],
          ],
        },
        {
          id: 'ss-2-2', title: 'And you?', src: 'pc', items: [
            ['Wena ke?', 'And you?', { note: 'To one person.' }],
            ['Nine ke?', 'And you all?', { alt: ['And you? (plural)'] }],
            ['Nami futsi', 'Me too', { alt: ['I also', 'Me also', 'And me too'] }],
            ['Ngikhona, wena unjani?', 'I am fine, how are you?', { alt: ["I'm fine, and you?", 'I am fine, and you?', "I'm fine, how are you?"] }],
            ['Nami ngikhona', 'I am also fine', { alt: ["I'm fine too", 'I am fine too', "I'm also fine"] }],
            ['Sawubona Themba', 'Hello Themba', {}],
          ],
        },
        {
          id: 'ss-2-3', title: 'Names', src: 'pc', items: [
            ['Ligama', 'Name', {}],
            ['Ngubani ligama lakho?', 'What is your name?', { alt: ["What's your name?"], ta: ['Ungubani ligama lakho?'] }],
            ['Ligama lami ngu...', 'My name is...', { alt: ['My name is'] }],
            ['Ngubani ligama lakhe?', 'What is his name?', { alt: ['What is her name?', 'What is his/her name?', "What's her name?", "What's his name?"] }],
            ['Ngiyajabula kukwati', 'I am happy to know you', { alt: ['Pleased to meet you', 'Nice to meet you', "I'm happy to know you"] }],
            ['Siyajabula kukwati', 'We are happy to know you', { alt: ["We're happy to know you", 'We are pleased to meet you'] }],
            ['Wemukelekile', 'You are welcome', { alt: ["You're welcome", 'Welcome'], note: 'To one person. Plural: Nemukelekile.' }],
          ],
        },
        {
          id: 'ss-2-4', title: 'Goodbye', src: 'pc', items: [
            ['Sala kahle', 'Stay well', { alt: ['Goodbye', 'Bye'], note: 'Said by the person LEAVING to the one staying.' }],
            ['Hamba kahle', 'Go well', { alt: ['Goodbye', 'Bye'], note: 'Said by the person STAYING to the one leaving.' }],
            ['Ngibuya eNingizimu Afrika', 'I come from South Africa', { alt: ["I'm from South Africa", 'I am from South Africa'], src: 'ai', note: 'The Peace Corps version is "Ngibuya eMelika" (I come from America).' }],
            ['Ngibuya eMelika', 'I come from America', { alt: ["I'm from America", 'I am from America'] }],
            ['Kahle', 'Well', { alt: ['Nicely', 'Good'] }],
          ],
        },
      ],
    },
    {
      id: 'ss-u3', icon: '💬', title: 'How are you?',
      desc: 'Talk about how you feel and your health.',
      tip: 'Many feelings use the "ngi-" prefix (I): ngi-jabulile (I am happy), ngi-dziniwe (I am tired). To say "I am not...", start with "a-": ngi-ya-phila (I am well) → a-ngi-phil-i (I am not well).',
      lessons: [
        {
          id: 'ss-3-1', title: 'Feelings', src: 'pc', items: [
            ['Ngiyaphila', 'I am well', { alt: ["I'm well", 'I am healthy'] }],
            ['Ngijabulile', 'I am happy', { alt: ["I'm happy"] }],
            ['Ngidziniwe', 'I am tired', { alt: ["I'm tired"] }],
            ['Kuhle', 'Good', { alt: ['It is good', "That's good", 'That is good'], ta: ['Kahle'] }],
            ['Namuhla', 'Today', {}],
            ['Unjani namuhla?', 'How are you today?', {}],
          ],
        },
        {
          id: 'ss-3-2', title: 'Not so well', src: 'pc', items: [
            ['Angiphili', 'I am not well', { alt: ["I'm not well", 'I am unwell'] }],
            ['Ngiyagula', 'I am sick', { alt: ["I'm sick", 'I am ill'] }],
            ['Nginemkhuhlane', 'I have flu', { alt: ['I have a cold', 'I have the flu', 'I have a flu'] }],
            ['Uyagula?', 'Are you sick?', { alt: ['You are sick?'] }],
            ['Kakhulu', 'Very much', { alt: ['Very', 'A lot', 'Much'] }],
            ['Ncesi', 'Sorry', { alt: ['Sorry about that', 'Excuse me'], note: 'For sympathy ("sorry to hear that") and for "excuse me".' }],
            ['Angiphili, nginemkhuhlane', 'I am not well, I have flu', { alt: ['I am not well, I have a cold', "I'm not well, I have flu", "I'm not well, I have a cold"] }],
          ],
        },
      ],
    },
    {
      id: 'ss-u4', icon: '👪', title: 'Family',
      desc: 'Family members, plus "I have" and "I don\'t have".',
      tip: '"I have" is ngi-na + a person (Nginababe, I have a father) or ngi-ne + a thing or group (Nginemndeni, I have a family). "I don\'t have" is Ngite + noun (Ngite bhuti). Elders who aren\'t your parents are still called make, babe, gogo and mkhulu.',
      lessons: [
        {
          id: 'ss-4-1', title: 'Parents & siblings', src: 'pc', items: [
            ['Umndeni', 'Family', {}],
            ['Babe', 'Father', { alt: ['Dad'] }],
            ['Make', 'Mother', { alt: ['Mom', 'Mum'] }],
            ['Bhuti', 'Brother', {}],
            ['Sisi', 'Sister', {}],
            ['Gogo', 'Grandmother', { alt: ['Granny', 'Grandma'], note: 'Also used for any very old woman.' }],
            ['Mkhulu', 'Grandfather', { alt: ['Grandpa'], note: 'Also used for any very old man.' }],
          ],
        },
        {
          id: 'ss-4-2', title: 'Children & partners', src: 'pc', items: [
            ['Umntfwana', 'Child', { note: '"ntfw" sounds like n-tf-w. Zulu: umntwana.' }],
            ['Indvodzana', 'Son', {}],
            ['Indvodzakati', 'Daughter', {}],
            ['Indvodza', 'Husband', { alt: ['Man'] }],
            ['Umfati', 'Wife', { alt: ['Woman'] }],
            ['Singani', 'Boyfriend', { alt: ['Girlfriend', 'Partner', 'Boyfriend/girlfriend', 'Friend'] }],
          ],
        },
        {
          id: 'ss-4-3', title: 'I have…', src: 'pc', items: [
            ['Nginemndeni', 'I have a family', {}],
            ['Nginababe', 'I have a father', {}],
            ['Nginamake', 'I have a mother', {}],
            ['Nginasisi', 'I have a sister', {}],
            ['Nginabhuti', 'I have a brother', {}],
            ['Nginesingani', 'I have a girlfriend', { alt: ['I have a boyfriend', 'I have a partner'] }],
          ],
        },
        {
          id: 'ss-4-4', title: "I don't have…", src: 'pc', items: [
            ['Ngite bhuti', "I don't have a brother", { alt: ['I do not have a brother'] }],
            ['Ngite indvodza', "I don't have a husband", { alt: ['I do not have a husband'] }],
            ['Ngite umfati', "I don't have a wife", { alt: ['I do not have a wife'] }],
            ['Ngite singani', "I don't have a girlfriend", { alt: ["I don't have a boyfriend", 'I do not have a girlfriend'] }],
            ['Sawubona mntfwanami', 'Hello my child', {}],
          ],
        },
      ],
    },
    {
      id: 'ss-u5', icon: '🧭', title: 'Useful expressions',
      desc: 'Phrases you\'ll use every day: sorry, repeat that please, no problem.',
      tip: '"Ngicela…" means "Please give me / may I…" and goes in front of what you\'re asking for: Ngicela uphindze (please repeat), Ngicela emanti (water, please). It\'s one of the most useful words you can learn.',
      lessons: [
        {
          id: 'ss-5-1', title: 'Polite words', src: 'pc', items: [
            ['Ncesi', 'Sorry', { alt: ['Excuse me'] }],
            ['Ngiyacolisa', 'I apologise', { alt: ['I apologize', "I'm sorry", 'I am sorry'], note: 'Stronger than ncesi, for when you made a mistake.' }],
            ['Kute inkinga', 'No problem', { alt: ["There's no problem", 'There is no problem'] }],
            ['Kulungile', "It's okay", { alt: ['Okay', "It's fine", 'Alright'] }],
            ['Ngiyacela', 'Please', { alt: ['Would you please'] }],
            ['Wemukelekile', 'You are welcome', { alt: ["You're welcome"] }],
          ],
        },
        {
          id: 'ss-5-2', title: 'Here, now, never', src: 'pc', items: [
            ['Lapha', 'Here', {}],
            ['Nyalo', 'Now', { ta: ['Manje'] }],
            ['Ngeke', 'Never', {}],
            ['Kungenteka', 'It is possible', { alt: ["It's possible", 'Maybe', 'Possibly'] }],
            ['Kungenteka vele?', 'Is it really possible?', { alt: ['Really?', 'Is it possible?'] }],
            ['Hhayi bo!', 'Come on!', { alt: ['No way!', 'Oh no!'] }],
          ],
        },
        {
          id: 'ss-5-3', title: 'Learner survival', src: 'pc', items: [
            ['Ngicela uphindze', 'Please repeat', { alt: ['Repeat please', 'Repeat, please'] }],
            ['Shano kancane, ngiyacela', 'Say it slowly, please', { alt: ['Say it slowly please', 'Speak slowly please'] }],
            ['Kancane', 'Slowly', { alt: ['A little', 'Gently'] }],
            ['Wo! Ngiyabona', 'Oh! I see', { alt: ['Oh, I see', 'I see'] }],
            ['Angati', "I don't know", { alt: ['I do not know'], src: 'ai' }],
            ['Ngiyeva', 'I understand', { alt: ['I hear', 'I hear you'], src: 'ai', note: 'Literally "I hear". Zulu: ngiyezwa.' }],
          ],
        },
      ],
    },
    {
      id: 'ss-u6', icon: '🍲', title: 'Food & drink',
      desc: 'Order food, say you\'re hungry, praise the cooking.',
      tip: 'Nouns come in classes, each with its own prefix: li-tiya (tea), si-nkhwa (bread), lu-bisi (milk), ema-nti (water). The prefix changes in the plural: si- → ti- (sitselo → titselo, fruits). Etiquette: sit down to eat. Eating while standing is seen as disrespectful.',
      lessons: [
        {
          id: 'ss-6-1', title: 'Drinks', src: 'pc', items: [
            ['Emanti', 'Water', { note: 'Zulu: amanzi. Zulu z → siSwati t.' }],
            ['Litiya', 'Tea', {}],
            ['Likhofi', 'Coffee', {}],
            ['Lubisi', 'Milk', {}],
            ['Ijusi', 'Juice', {}],
            ['Shukela', 'Sugar', {}],
            ['Ngomile', 'I am thirsty', { alt: ["I'm thirsty"] }],
          ],
        },
        {
          id: 'ss-6-2', title: 'Food', src: 'pc', items: [
            ['Sinkhwa', 'Bread', {}],
            ['Lilayisi', 'Rice', {}],
            ['Luswayi', 'Salt', {}],
            ['Emaveji', 'Vegetables', { alt: ['Veggies', 'Veg'] }],
            ['Titselo', 'Fruits', { alt: ['Fruit'] }],
            ['Inyama', 'Meat', { src: 'hb' }],
            ['Licandza', 'Egg', { src: 'hb' }],
            ['Inhlanti', 'Fish', { src: 'hb' }],
          ],
        },
        {
          id: 'ss-6-3', title: 'Mealtimes', src: 'pc', items: [
            ['Libhulakufesi', 'Breakfast', {}],
            ['Lidina', 'Lunch', { alt: ['Dinner'], note: 'Lidina can mean lunch or dinner.' }],
            ['Ngilambile', 'I am hungry', { alt: ["I'm hungry"] }],
            ['Ngesutsi', 'I am full', { alt: ["I'm full"] }],
            ['Kumnandzi', 'It is delicious', { alt: ["It's delicious", 'It is nice', 'It is tasty', 'Delicious', 'Tasty', "It's tasty"] }],
            ['Kumnandzi kakhulu!', 'It is very delicious!', { alt: ["It's very tasty!", 'It is very tasty!', 'Very delicious!'], src: 'ai' }],
          ],
        },
        {
          id: 'ss-6-4', title: 'Asking for things', src: 'ai', items: [
            ['Ngicela emanti', 'Water, please', { alt: ['May I have water?', 'Please give me water', 'I ask for water'] }],
            ['Ngicela litiya', 'Tea, please', { alt: ['May I have tea?', 'Please give me tea'] }],
            ['Ngifuna sinkhwa', 'I want bread', {}],
            ['Ngifuna kudla', 'I want food', { alt: ['I want to eat'] }],
            ['Malini?', 'How much?', { alt: ['How much is it?'], src: 'pc' }],
          ],
        },
      ],
    },
    {
      id: 'ss-u7', icon: '🚌', title: 'Getting around',
      desc: 'Taxis, buses, shops and directions.',
      tip: 'To say "at / to / in a place", add e- at the start and -ini at the end: sitolo (shop) → e-sitol-ini (at the shop), liposi → e-pos-ini (at the post office), siteshi → e-sitesh-ini.',
      lessons: [
        {
          id: 'ss-7-1', title: 'Taking a taxi', src: 'pc', items: [
            ['Iyaphi?', 'Where is it going?', { alt: ['Where is it going to?', 'Where does it go?'], note: 'About a bus or taxi.' }],
            ['Isuka nini?', 'When is it leaving?', { alt: ['When does it leave?'] }],
            ['Malini?', 'How much?', { alt: ['How much is it?'] }],
            ['Ngicela ishintji', 'Change please', { alt: ['My change, please', 'Change, please'] }],
            ['Siteshi', 'Station', { alt: ['Bus station'] }],
            ['Esiteshini', 'At the station', { alt: ['At the bus station', 'To the station'] }],
          ],
        },
        {
          id: 'ss-7-2', title: 'Left & right', src: 'pc', items: [
            ['Ngesancele', 'On the left', { alt: ['Left', 'To the left'] }],
            ['Ngesekudla', 'On the right', { alt: ['Right', 'To the right'] }],
            ['Eceleni', 'Next to', { alt: ['Beside', 'Next to it'] }],
            ['Etulu', 'Up', { alt: ['Upwards', 'Above'], ta: ['Enhla'] }],
            ['Entasi', 'Down', { alt: ['Downwards', 'Below'] }],
          ],
        },
        {
          id: 'ss-7-3', title: 'In town', src: 'pc', items: [
            ['Sitolo', 'Shop', { alt: ['Store'] }],
            ['Esitolo', 'At the shop', { alt: ['To the shop', 'At the store'], ta: ['Esitolo'] }],
            ['Liposi', 'Post office', {}],
            ['Eposini', 'At the post office', { alt: ['To the post office'] }],
            ['Lidolobha', 'Town', {}],
            ['Edolobheni', 'In town', { alt: ['To town', 'At town'] }],
          ],
        },
      ],
    },
    {
      id: 'ss-u8', icon: '⏰', title: 'Time & days',
      desc: 'Today, tomorrow, parts of the day, days of the week.',
      tip: 'The days of the week are mostly numbered from Monday: Lesi-bili (2nd, Tuesday), Lesi-tsatfu (3rd), Lesi-ne (4th), Lesi-hlanu (5th). Sunday is liSontfo, which is related to the word for "week".',
      lessons: [
        {
          id: 'ss-8-1', title: 'Yesterday & tomorrow', src: 'pc', items: [
            ['Namuhla', 'Today', {}],
            ['Itolo', 'Yesterday', { note: 'Zulu: izolo (z → t again).' }],
            ['Kusasa', 'Tomorrow', {}],
            ['Sikhatsi', 'Time', {}],
            ['Liviki', 'Week', {}],
            ['Inyanga', 'Month', { alt: ['Moon'] }],
            ['Umnyaka', 'Year', {}],
          ],
        },
        {
          id: 'ss-8-2', title: 'Parts of the day', src: 'pc', items: [
            ['Ekuseni', 'In the morning', { alt: ['Morning'] }],
            ['Emini', 'At noon', { alt: ['Midday', 'At midday', 'Noon'] }],
            ['Entsambama', 'In the afternoon', { alt: ['Afternoon'] }],
            ['Kusihlwa', 'In the evening', { alt: ['Evening'] }],
            ['Ebusuku', 'At night', { alt: ['Night'] }],
          ],
        },
        {
          id: 'ss-8-3', title: 'Days of the week', src: 'ai', items: [
            ['Msombuluko', 'Monday', {}],
            ['Lesibili', 'Tuesday', {}],
            ['Lesitsatfu', 'Wednesday', {}],
            ['Lesine', 'Thursday', {}],
            ['Lesihlanu', 'Friday', {}],
            ['uMgcibelo', 'Saturday', {}],
            ['liSontfo', 'Sunday', {}],
          ],
        },
      ],
    },
    {
      id: 'ss-u9', icon: '🔢', title: 'Numbers',
      desc: 'Count from one to ten.',
      tip: 'Six to nine are built from other words: sificaminyamabili (8) and sificalunye (9) literally mean "it is short by two / by one" finger before ten.',
      lessons: [
        {
          id: 'ss-9-1', title: 'One to five', src: 'ai', items: [
            ['Kunye', 'One', { alt: ['1'] }],
            ['Kubili', 'Two', { alt: ['2'] }],
            ['Kutsatfu', 'Three', { alt: ['3'] }],
            ['Kune', 'Four', { alt: ['4'] }],
            ['Kuhlanu', 'Five', { alt: ['5'] }],
          ],
        },
        {
          id: 'ss-9-2', title: 'Six to ten', src: 'ai', items: [
            ['Sitfupha', 'Six', { alt: ['6'] }],
            ['Sikhombisa', 'Seven', { alt: ['7'], src: 'hb' }],
            ['Sificaminyamabili', 'Eight', { alt: ['8'] }],
            ['Sificalunye', 'Nine', { alt: ['9'] }],
            ['Lishumi', 'Ten', { alt: ['10'] }],
          ],
        },
      ],
    },
    {
      id: 'ss-u10', icon: '🧱', title: 'Building sentences',
      desc: 'Verbs and the "I / you / we" prefixes: your first real sentences.',
      tip: 'Verbs take a prefix for who is doing the action: ngi- (I), u- (you), u-/a- (he/she), si- (we), ni- (you all), ba- (they). Add -ya- when nothing comes after the verb: Ngiya-fundza (I am learning) but Ngifundza siSwati (I am learning siSwati). Make it negative with a-…-i: ngifuna → a-ngi-fun-i (I don\'t want).',
      lessons: [
        {
          id: 'ss-10-1', title: 'Action words', src: 'ai', items: [
            ['Kuhamba', 'To go', { alt: ['To walk', 'Go', 'Walk'], src: 'pc' }],
            ['Kudla', 'To eat', { alt: ['Eat', 'Food'], note: 'Means both "to eat" and "food".' }],
            ['Kunatsa', 'To drink', { alt: ['Drink'], src: 'hb', note: 'Zulu uses a different word: ukuphuza.' }],
            ['Kufundza', 'To learn', { alt: ['To read', 'To study', 'Learn', 'Read'], src: 'pc' }],
            ['Kukhuluma', 'To speak', { alt: ['To talk', 'Speak'], src: 'pc' }],
            ['Kubona', 'To see', { alt: ['See'] }],
            ['Kufuna', 'To want', { alt: ['Want', 'To look for'] }],
            ['Kusebenta', 'To work', { alt: ['Work'], note: 'Zulu: ukusebenza.' }],
          ],
        },
        {
          id: 'ss-10-2', title: 'I am learning', src: 'ai', items: [
            ['Ngiyafundza', 'I am learning', { alt: ["I'm learning", 'I am studying', 'I am reading'] }],
            ['Ngifundza siSwati', 'I am learning siSwati', { alt: ["I'm learning siSwati", 'I learn siSwati', 'I am learning Swati'] }],
            ['Ngikhuluma siSwati kancane', 'I speak a little siSwati', { alt: ['I speak siSwati a little', 'I speak a little Swati'] }],
            ['Uyakhuluma siSwati?', 'Do you speak siSwati?', { alt: ['Can you speak siSwati?', 'Do you speak Swati?'] }],
            ['Ngifuna kufundza', 'I want to learn', { alt: ['I want to study', 'I want to read'] }],
            ['Ngiyasebenta', 'I am working', { alt: ["I'm working", 'I work'] }],
          ],
        },
        {
          id: 'ss-10-3', title: 'Saying no', src: 'ai', items: [
            ['Angifuni', "I don't want", { alt: ['I do not want', "I don't want it"] }],
            ['Angiboni', "I don't see", { alt: ['I do not see', "I can't see"] }],
            ['Angati', "I don't know", { alt: ['I do not know'] }],
            ['Angiphili', 'I am not well', { alt: ["I'm not well"], src: 'pc' }],
            ['Ngeke', 'Never', { src: 'pc' }],
          ],
        },
      ],
    },
    {
      id: 'ss-u11', icon: '🐄', title: 'Animals & nature',
      desc: 'Cattle, wildlife, the sky and the land.',
      tip: 'Cattle (tinkhomo) are at the heart of Swazi culture and wealth. That\'s why so many proverbs mention them. Many animal names start with in- (singular) and become tin- in the plural: inkhukhu → tinkhukhu (chickens).',
      lessons: [
        {
          id: 'ss-11-1', title: 'At home', src: 'hb', items: [
            ['Inkhomo', 'Cow', { alt: ['Cattle', 'Ox'] }],
            ['Imbuti', 'Goat', {}],
            ['Imvu', 'Sheep', {}],
            ['Inkhukhu', 'Chicken', { alt: ['Hen'] }],
            ['Likati', 'Cat', { src: 'pc' }],
            ['Inja', 'Dog', { src: 'ai' }],
          ],
        },
        {
          id: 'ss-11-2', title: 'In the wild', src: 'hb', items: [
            ['Inyoni', 'Bird', {}],
            ['Inyoka', 'Snake', {}],
            ['Ingwenya', 'Crocodile', {}],
            ['Imvubu', 'Hippo', { alt: ['Hippopotamus'] }],
            ['Libululu', 'Puff adder', {}],
            ['Lintfutfwane', 'Ant', {}],
          ],
        },
        {
          id: 'ss-11-3', title: 'Sky & land', src: 'ai', items: [
            ['Lilanga', 'Sun', { alt: ['Day'] }],
            ['Inyanga', 'Moon', { alt: ['Month'] }],
            ['Imvula', 'Rain', {}],
            ['Sihlahla', 'Tree', { src: 'hb' }],
            ['Litje', 'Stone', { alt: ['Rock'], src: 'hb' }],
            ['Intsaba', 'Mountain', {}],
          ],
        },
      ],
    },
    {
      id: 'ss-u12', icon: '🤝', title: 'Respect & culture',
      desc: 'Greet with titles, address elders, show hospitality.',
      tip: 'Give and receive things with your right hand. Hospitality matters a lot: people visit without appointments, and a good host always shares. Elders\' word is respected and rarely questioned in public.',
      lessons: [
        {
          id: 'ss-12-1', title: 'Greeting with respect', src: 'pc', items: [
            ['Sawubona make', 'Hello mother', { alt: ["Hello ma'am", 'Hello madam'], note: 'To any older woman, not just your own mother.' }],
            ['Sawubona babe', 'Hello father', { alt: ['Hello sir'], note: 'To any older man.' }],
            ['Sawubona gogo', 'Hello grandmother', { alt: ['Hello granny'] }],
            ['Sawubona make Shongwe', 'Hello Mrs Shongwe', { alt: ['Hello mother Shongwe', 'Hello Mrs. Shongwe'], note: 'Title + surname is very respectful.' }],
            ['Ngiyabonga kakhulu', 'Thank you very much', { alt: ['Thanks a lot', 'Thank you so much'], src: 'ai' }],
          ],
        },
      ],
    },
  ],

  // Daily wisdom. Proverbs from the Special Skills Handbook (collected by E.C.L. Kunene).
  // The OCR text is damaged in places, so meanings are reconstructed from the readable parts.
  proverbs: [
    { t: 'Tandla tiyagezana', lit: 'Hands wash each other', meaning: 'People must help one another; we all depend on each other.', reflect: 'Whose hands have been washing yours lately, and whose are you washing?', src: 'hb' },
    { t: 'Litsemba alibulali', lit: 'Hope does not kill', meaning: 'Keep hoping. Said when someone is disappointed but shouldn\'t give up.', reflect: 'What are you still quietly hoping for?', src: 'hb' },
    { t: 'Kusa kusa', lit: 'It dawns, it dawns', meaning: 'No day dawns the same way. Fortunes change, and the overlooked may rise to honour.', reflect: 'What looked small in your life that has since risen?', src: 'hb' },
    { t: 'Matse nelulwimi', lit: 'It is saliva and the tongue', meaning: 'Describes a very close relationship: two people who are never apart.', reflect: 'Who is the saliva to your tongue?', src: 'hb' },
    { t: 'Sihlahla asinyelwa', lit: 'You do not defile the tree', meaning: 'Don\'t disrespect the one who gave you shade. Honour those who helped you.', reflect: 'Which "tree" have you forgotten to thank?', src: 'hb' },
    { t: 'Unesandla', lit: 'He/she has a hand', meaning: 'Said of a generous person who gives easily.', reflect: 'How could your hand be open today?', src: 'hb' },
    { t: 'Yinkhosi', lit: 'He/she is a king', meaning: 'Said of someone who is very kind. Kindness is royal.', reflect: 'What would kindness look like if it were your crown?', src: 'hb' },
    { t: 'Bamba litsambo', lit: 'Hold the bone', meaning: 'An invitation to shake hands, like "give me five!"', reflect: 'Whose hand do you need to hold out yours to?', src: 'hb' },
    { t: 'Ubogawula ubheka', lit: 'Chop and look', meaning: 'Be careful how you act and speak with others. Watch where your axe falls.', reflect: 'Where do your words need more care?', src: 'hb' },
    { t: 'Kugeza tandla', lit: 'To wash one\'s hands', meaning: 'Said by someone who gives up on a problem they cannot solve.', reflect: 'What is it time to wash your hands of?', src: 'hb' },
    { t: 'Kubulala emabhodlela', lit: 'To break bottles', meaning: 'To send very warm, enthusiastic greetings to a friend through someone else.', reflect: 'Who deserves your broken bottles today?', src: 'hb' },
    { t: 'Insika seyiwile', lit: 'The support pole has fallen', meaning: 'The pillar of the family (the breadwinner or head) has passed away.', reflect: 'Who are the pillars holding up your house?', src: 'hb' },
    { t: 'Unelulwimi loludze', lit: 'He/she has a long tongue', meaning: 'Said of someone who talks too much, usually negatively.', reflect: 'Where could silence say more than speech?', src: 'hb' },
    { t: 'Unelihlo lelibi', lit: 'He/she has a bad eye', meaning: 'Describes a jealous person.', reflect: 'What does your eye linger on that belongs to someone else?', src: 'hb' },
    { t: 'Wadla linhaphu lemvu', lit: 'He/she ate the sheep\'s lung', meaning: 'Said of someone afraid to make a decision or act.', reflect: 'What decision have you been chewing on too long?', src: 'hb' },
    { t: 'Ludziwo lufuta imbita', lit: 'The small clay pot resembles the big pot', meaning: 'Children take after their parents. Like father, like son.', reflect: 'What did you inherit that you want to pass on?', src: 'hb' },
    { t: 'Likati lilala etiko', lit: 'The cat sleeps in the fireplace', meaning: 'Extreme poverty: there\'s been no fire, no cooking, for so long that the cat sleeps there.', reflect: 'Whose fireplace is cold near you?', src: 'hb' },
    { t: 'Sisu semhambi asingakanani', lit: 'A traveller\'s stomach is not big', meaning: 'Always feed a traveller. They don\'t need much, and hospitality is a duty.', reflect: 'Who is the traveller at your door?', src: 'hb' },
    { t: 'Kubona kanye kubona kabili', lit: 'To see once is to see twice', meaning: 'What happened once can happen again, so take precautions.', reflect: 'What lesson did once teach you?', src: 'hb' },
    { t: 'Lunyawo alunamphumulo', lit: 'The foot has no rest', meaning: 'Said of someone always on the move, a constant traveller.', reflect: 'Where is your restless foot taking you?', src: 'hb' },
    { t: 'Akahlalwa yimphungane', lit: 'No fly settles on him/her', meaning: 'Describes someone who is always clean and neat.', reflect: 'What small discipline keeps you sharp?', src: 'hb' },
    { t: 'Tifa ngamvunye', lit: 'They die because of one', meaning: 'One person\'s wrongdoing can bring ruin on the whole group.', reflect: 'Who is affected by your choices?', src: 'hb' },
    { t: 'Umuntfu ngumuntfu ngebantfu', lit: 'A person is a person through people', meaning: 'Ubuntu (buntfu): we become fully human through our relationships with others.', reflect: 'Who made you who you are?', src: 'ai' },
  ],

  // Theology & worldview: big ideas, for the Wisdom tab.
  concepts: [
    { t: 'Mvelinchanti', en: 'The Creator', body: 'The traditional Swazi name for the Supreme Being, often explained as "the one who appeared first". Seen as distant and above daily life, approached through the ancestors.', src: 'ai' },
    { t: 'Emadloti', en: 'The ancestors', body: 'The living dead: family members who have died but still care for and guide their descendants. They are honoured through ritual and are the closest link between people and the divine.', src: 'ai' },
    { t: 'Buntfu', en: 'Ubuntu / humanity', body: 'Personhood and dignity are realised in community, not alone. Hospitality, respect and sharing are its everyday expressions.', src: 'ai' },
    { t: 'Incwala', en: 'Kingship ceremony', body: 'The most sacred Swazi ceremony, held around the summer solstice. It renews the kingship and the nation, and the king tastes the first fruits of the season.', src: 'ai' },
    { t: 'Umhlanga', en: 'Reed Dance', body: 'An annual late-winter ceremony where young women cut reeds and bring them to the Queen Mother, celebrating community, womanhood and the nation.', src: 'ai' },
    { t: 'Inhlonipho', en: 'Respect', body: 'A whole system of respectful behaviour and speech, especially toward elders and in-laws: greeting with titles, lowering the eyes, using both hands or the right hand.', src: 'ai' },
  ],

  culture: [
    'Always greet before you ask anything. Starting with your request is considered rude, a sign of bad upbringing.',
    'Call older people make (mother) and babe (father) even if they\'re strangers. Very old people are gogo and mkhulu.',
    'Use your right hand to give and receive things.',
    'Sit down when you eat. Eating while standing is disrespectful, especially in a family setting.',
    'Hospitality is highly valued: visitors arrive without appointments, and the host is expected to be generous.',
    'Elders are the source of wisdom; their word is rarely questioned in public.',
    'Greetings are how you find out how someone really is that day. Take your time with them.',
  ],
};
