import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Volume2, Play, Square, RefreshCw, Undo, Eye, EyeOff, 
  Search, Award, Sparkles, BookOpen, MessageCircle, PenTool, Gamepad2, 
  GraduationCap, Pause, Settings2, Headphones
} from 'lucide-react';

/* =========================================================
   1. VOCABULARY DATA
   ========================================================= */
interface WordItem {
  h: string;
  p: string;
  m: string;
  ex: [string, string][];
}

const WORDS: WordItem[] = [
  { h: '下午', p: 'xiàwǔ', m: 'buổi chiều', ex: [
    ['下午我去图书馆。', 'Buổi chiều tôi đi thư viện.'],
    ['明天下午你有空吗？', 'Chiều mai bạn có rảnh không?'],
    ['今天下午天气很好。', 'Chiều nay thời tiết rất đẹp.']
  ]},
  { h: '上午', p: 'shàngwǔ', m: 'buổi sáng', ex: [
    ['上午我去银行。', 'Buổi sáng tôi đi ngân hàng.'],
    ['上午我很忙。', 'Buổi sáng tôi rất bận.'],
    ['明天上午我们去上课。', 'Sáng mai chúng tôi đi học.']
  ]},
  { h: '图书馆', p: 'túshūguǎn', m: 'thư viện', ex: [
    ['你去不去图书馆？', 'Bạn có đi thư viện không?'],
    ['图书馆里很安静。', 'Trong thư viện rất yên tĩnh.'],
    ['他在图书馆看书。', 'Anh ấy đọc sách ở thư viện.']
  ]},
  { h: '换', p: 'huàn', m: 'đổi, thay', ex: [
    ['我要去银行换钱。', 'Tôi muốn đi ngân hàng đổi tiền.'],
    ['我想换人民币。', 'Tôi muốn đổi nhân dân tệ.'],
    ['你换什么钱？', 'Bạn đổi tiền gì?']
  ]},
  { h: '小姐', p: 'xiǎojiě', m: 'cô, tiểu thư', ex: [
    ['小姐，我换钱。', 'Cô ơi, tôi đổi tiền.'],
    ['那位小姐是谁？', 'Cô gái kia là ai?'],
    ['小姐，请等一下。', 'Cô ơi, xin đợi một chút.']
  ]},
  { h: '营业员', p: 'yíngyèyuán', m: 'nhân viên giao dịch', ex: [
    ['营业员在银行工作。', 'Nhân viên giao dịch làm việc ở ngân hàng.'],
    ['那个营业员很热情。', 'Nhân viên giao dịch kia rất nhiệt tình.'],
    ['请问营业员在哪里？', 'Xin hỏi nhân viên giao dịch ở đâu?']
  ]},
  { h: '人民币', p: 'rénmínbì', m: 'nhân dân tệ (RMB)', ex: [
    ['我换人民币。', 'Tôi đổi nhân dân tệ.'],
    ['这是人民币。', 'Đây là nhân dân tệ.'],
    ['人民币的汇率是多少？', 'Tỷ giá nhân dân tệ là bao nhiêu?']
  ]},
  { h: '百', p: 'bǎi', m: 'trăm', ex: [
    ['二百美元。', 'Hai trăm đô la Mỹ.'],
    ['我有一百块钱。', 'Tôi có một trăm tệ.'],
    ['他买了一百个苹果。', 'Anh ấy mua một trăm quả táo.']
  ]},
  { h: '千', p: 'qiān', m: 'nghìn', ex: [
    ['三千人民币。', 'Ba nghìn tệ.'],
    ['他花了五千块钱。', 'Anh ấy đã tiêu năm nghìn tệ.'],
    ['这个手机一千块。', 'Cái điện thoại này một nghìn tệ.']
  ]},
  { h: '万', p: 'wàn', m: 'vạn (mười nghìn)', ex: [
    ['一万块钱。', 'Mười nghìn tệ.'],
    ['今天卖了一万块。', 'Hôm nay bán được mười nghìn tệ.'],
    ['这个房子要一百万。', 'Căn nhà này cần một triệu.']
  ]},
  { h: '美元', p: 'měiyuán', m: 'đô la Mỹ (USD)', ex: [
    ['我换二百美元。', 'Tôi đổi hai trăm đô la Mỹ.'],
    ['美元比人民币贵。', 'Đô la Mỹ đắt hơn tệ.'],
    ['你有美元吗？', 'Bạn có đô la Mỹ không?']
  ]},
  { h: '港币', p: 'gǎngbì', m: 'đô la Hồng Kông (HKD)', ex: [
    ['他换港币。', 'Anh ấy đổi đô la Hồng Kông.'],
    ['港币怎么换？', 'Đô la Hồng Kông đổi thế nào?'],
    ['我想换一点港币。', 'Tôi muốn đổi một chút đô la Hồng Kông.']
  ]},
  { h: '日元', p: 'rìyuán', m: 'Yên Nhật (JPY)', ex: [
    ['日元换人民币。', 'Yên Nhật đổi sang tệ.'],
    ['日元现在便宜吗？', 'Yên Nhật bây giờ có rẻ không?'],
    ['他有很多日元。', 'Anh ấy có rất nhiều Yên Nhật.']
  ]},
  { h: '韩元', p: 'hányuán', m: 'Won Hàn Quốc (KRW)', ex: [
    ['韩元换人民币。', 'Won Hàn Quốc đổi sang tệ.'],
    ['韩元不值钱。', 'Won Hàn Quốc không đáng tiền.'],
    ['你去韩国要换韩元。', 'Bạn đi Hàn Quốc phải đổi Won.']
  ]},
  { h: '欧元', p: 'ōuyuán', m: 'Euro (EUR)', ex: [
    ['欧元换人民币。', 'Euro đổi sang tệ.'],
    ['欧元很贵。', 'Euro rất đắt.'],
    ['这是五十欧元。', 'Đây là năm mươi Euro.']
  ]},
  { h: '等', p: 'děng', m: 'đợi, chờ', ex: [
    ['请等一会儿。', 'Xin đợi một lát.'],
    ['你等我一下。', 'Bạn đợi tôi một chút.'],
    ['我们在外面等你。', 'Chúng tôi đợi bạn ở ngoài.']
  ]},
  { h: '一会儿', p: 'yíhuìr', m: 'một lát, một chốc', ex: [
    ['请等一会儿。', 'Xin đợi một lát.'],
    ['我一会儿就去。', 'Tôi sẽ đi ngay.'],
    ['他一会儿就回来。', 'Anh ấy sẽ về ngay.']
  ]},
  { h: '先生', p: 'xiānsheng', m: 'ngài, ông, tiên sinh', ex: [
    ['先生，给您钱。', 'Thưa ngài, tiền của ngài đây.'],
    ['王先生在家吗？', 'Ông Vương có nhà không?'],
    ['这位先生是谁？', 'Vị tiên sinh này là ai?']
  ]},
  { h: '数', p: 'shǔ', m: 'đếm (động từ)', ex: [
    ['请数数。', 'Xin hãy đếm.'],
    ['你数一下钱。', 'Bạn đếm tiền một chút.'],
    ['他在数苹果。', 'Anh ấy đang đếm táo.']
  ]}
];

/* =========================================================
   2. DIALOGUE DATA (TÁCH BIỆT RÕ RÀNG TỪNG LƯỢT LỜI)
   ========================================================= */
interface DialogueLine {
  role: 'A' | 'B' | 'C';
  roleName: string;
  zh: string;
  py: string;
  vn: string;
  gender: 'male' | 'female';
}

const DIALOGUE: DialogueLine[] = [
  { role: 'A', roleName: 'Bạn (A)', zh: '下午我去图书馆，你去不去？', py: 'Xiàwǔ wǒ qù túshūguǎn, nǐ qù bú qù?', vn: 'Buổi chiều tôi đi thư viện, bạn có đi không?', gender: 'female' },
  { role: 'B', roleName: 'Tôi (B)', zh: '我不去。我要去银行换钱。', py: 'Wǒ bú qù. Wǒ yào qù yínháng huàn qián.', vn: 'Tôi không đi. Tôi muốn đi ngân hàng đổi tiền.', gender: 'male' },
  { role: 'B', roleName: 'Tôi (B)', zh: '小姐，我换钱。', py: 'Xiǎojiě, wǒ huàn qián.', vn: 'Cô ơi, tôi đổi tiền.', gender: 'male' },
  { role: 'C', roleName: 'Giao dịch viên (C)', zh: '您换什么钱？', py: 'Nín huàn shénme qián?', vn: 'Ngài đổi tiền gì?', gender: 'female' },
  { role: 'B', roleName: 'Tôi (B)', zh: '我换人民币。', py: 'Wǒ huàn rénmínbì.', vn: 'Tôi đổi nhân dân tệ.', gender: 'male' },
  { role: 'C', roleName: 'Giao dịch viên (C)', zh: '换多少？', py: 'Huàn duōshao?', vn: 'Đổi bao nhiêu?', gender: 'female' },
  { role: 'B', roleName: 'Tôi (B)', zh: '二百美元。', py: 'Èrbǎi měiyuán.', vn: 'Hai trăm đô la Mỹ.', gender: 'male' },
  { role: 'C', roleName: 'Giao dịch viên (C)', zh: '请等一会儿。', py: 'Qǐng děng yíhuìr.', vn: 'Xin đợi một lát.', gender: 'female' },
  { role: 'C', roleName: 'Giao dịch viên (C)', zh: '先生，给您钱。请数数。', py: 'Xiānsheng, gěi nín qián. Qǐng shǔshu.', vn: 'Thưa ngài, tiền của ngài đây. Xin hãy đếm.', gender: 'female' },
  { role: 'B', roleName: 'Tôi (B)', zh: '对。谢谢！', py: 'Duì. Xièxie!', vn: 'Đúng rồi. Cảm ơn!', gender: 'male' },
  { role: 'C', roleName: 'Giao dịch viên (C)', zh: '不客气！', py: 'Bú kèqi!', vn: 'Không có gì!', gender: 'female' }
];

/* =========================================================
   TEXTBOOK AUDIO SYNCHRONIZATION (09-1: BÀI KHÓA & 09-2: TỪ VỰNG)
   ========================================================= */
const DIALOGUE_AUDIO_FULL = '/audio/dialogue_full.mp3';
const VOCAB_AUDIO_FULL = '/audio/vocab_full.mp3';

// 09-1: 11 câu hội thoại chuẩn xác theo băng giáo trình
const DIALOGUE_AUDIO_FILES = [
  '/audio/dialogue/line_0.mp3',  // 下午我去图书馆，你去不去？
  '/audio/dialogue/line_1.mp3',  // 我不去。我要去银行换钱。
  '/audio/dialogue/line_2.mp3',  // 小姐，我换钱。
  '/audio/dialogue/line_3.mp3',  // 您换什么钱？
  '/audio/dialogue/line_4.mp3',  // 我换人民币。
  '/audio/dialogue/line_5.mp3',  // 换多少？
  '/audio/dialogue/line_6.mp3',  // 二百美元。
  '/audio/dialogue/line_7.mp3',  // 请等一会儿。
  '/audio/dialogue/line_8.mp3',  // 先生，给您钱。请数数。
  '/audio/dialogue/line_9.mp3',  // 对。谢谢！
  '/audio/dialogue/line_10.mp3', // 不客气！
];

const DIALOGUE_AUDIO_MAP: Record<string, string> = {
  '下午我去图书馆，你去不去？': '/audio/dialogue/line_0.mp3',
  '我不去。我要去银行换钱。': '/audio/dialogue/line_1.mp3',
  '我不去，我要去银行换钱。': '/audio/dialogue/line_1.mp3',
  '小姐，我换钱。': '/audio/dialogue/line_2.mp3',
  '您换什么钱？': '/audio/dialogue/line_3.mp3',
  '我换人民币。': '/audio/dialogue/line_4.mp3',
  '换多少？': '/audio/dialogue/line_5.mp3',
  '二百美元。': '/audio/dialogue/line_6.mp3',
  '请等一会儿。': '/audio/dialogue/line_7.mp3',
  '先生，给您钱。请数数。': '/audio/dialogue/line_8.mp3',
  '对。谢谢！': '/audio/dialogue/line_9.mp3',
  '不客气！': '/audio/dialogue/line_10.mp3',
};

// Mốc thời gian (giây) từng câu trên băng gốc 09-1 để highlight karaoke
const DIALOGUE_TIMESTAMP_LIST = [
  { start: 19.5, end: 22.4 }, // 下午我去图书馆，你去不去？
  { start: 22.7, end: 29.3 }, // 我不去，我要去银行换钱。
  { start: 31.3, end: 33.8 }, // 小姐，我换钱。
  { start: 34.7, end: 36.7 }, // 您换什么钱？
  { start: 37.8, end: 39.5 }, // 我换人民币。
  { start: 40.6, end: 42.0 }, // 换多少？
  { start: 43.0, end: 44.2 }, // 二百美元。
  { start: 45.2, end: 47.0 }, // 请等一会儿。
  { start: 48.3, end: 53.0 }, // 先生，给您钱。请数数。
  { start: 54.1, end: 56.3 }, // 对。谢谢！
  { start: 57.1, end: 58.7 }, // 不客气！
];

// 09-2: 19 từ vựng chuẩn xác theo băng giáo trình
const VOCAB_AUDIO_FILES = [
  '/audio/vocab/word_0.mp3',  // 下午
  '/audio/vocab/word_1.mp3',  // 上午
  '/audio/vocab/word_2.mp3',  // 图书馆
  '/audio/vocab/word_3.mp3',  // 换
  '/audio/vocab/word_4.mp3',  // 小姐
  '/audio/vocab/word_5.mp3',  // 营业员
  '/audio/vocab/word_6.mp3',  // 人民币
  '/audio/vocab/word_7.mp3',  // 百
  '/audio/vocab/word_8.mp3',  // 千
  '/audio/vocab/word_9.mp3',  // 万
  '/audio/vocab/word_10.mp3', // 美元
  '/audio/vocab/word_11.mp3', // 港币
  '/audio/vocab/word_12.mp3', // 日元
  '/audio/vocab/word_13.mp3', // 韩元
  '/audio/vocab/word_14.mp3', // 欧元
  '/audio/vocab/word_15.mp3', // 等
  '/audio/vocab/word_16.mp3', // 一会儿
  '/audio/vocab/word_17.mp3', // 先生
  '/audio/vocab/word_18.mp3', // 数
];

const VOCAB_AUDIO_MAP: Record<string, string> = {
  '下午': '/audio/vocab/word_0.mp3',
  '上午': '/audio/vocab/word_1.mp3',
  '图书馆': '/audio/vocab/word_2.mp3',
  '换': '/audio/vocab/word_3.mp3',
  '小姐': '/audio/vocab/word_4.mp3',
  '营业员': '/audio/vocab/word_5.mp3',
  '人民币': '/audio/vocab/word_6.mp3',
  '百': '/audio/vocab/word_7.mp3',
  '千': '/audio/vocab/word_8.mp3',
  '万': '/audio/vocab/word_9.mp3',
  '美元': '/audio/vocab/word_10.mp3',
  '港币': '/audio/vocab/word_11.mp3',
  '日元': '/audio/vocab/word_12.mp3',
  '韩元': '/audio/vocab/word_13.mp3',
  '欧元': '/audio/vocab/word_14.mp3',
  '等': '/audio/vocab/word_15.mp3',
  '一会儿': '/audio/vocab/word_16.mp3',
  '先生': '/audio/vocab/word_17.mp3',
  '数': '/audio/vocab/word_18.mp3',
};

// Mốc thời gian (giây) từng từ trên băng gốc 09-2 để highlight karaoke
const VOCAB_TIMESTAMP_LIST = [
  { start: 6.4, end: 7.8 },   // 下午
  { start: 8.6, end: 10.0 },  // 上午
  { start: 10.9, end: 12.6 }, // 图书馆
  { start: 13.4, end: 14.5 }, // 换
  { start: 15.2, end: 16.7 }, // 小姐
  { start: 17.6, end: 19.3 }, // 营业员
  { start: 20.2, end: 21.9 }, // 人民币
  { start: 22.8, end: 23.9 }, // 百
  { start: 24.5, end: 25.7 }, // 千
  { start: 26.4, end: 27.5 }, // 万
  { start: 28.2, end: 29.7 }, // 美元
  { start: 30.4, end: 31.8 }, // 港币
  { start: 32.7, end: 34.2 }, // 日元
  { start: 34.9, end: 36.4 }, // 韩元
  { start: 37.2, end: 38.6 }, // 欧元
  { start: 39.6, end: 40.7 }, // 等
  { start: 41.3, end: 42.7 }, // 一会儿
  { start: 43.4, end: 44.7 }, // 先生
  { start: 45.4, end: 46.8 }, // 数
];

// Ánh xạ audio chuẩn cho các câu ví dụ trong Từ vựng & Ngữ pháp
const EXAMPLES_AUDIO_MAP: Record<string, string> = {
  '一万块钱。': '/audio/examples/ex_440a71ccd674.mp3',
  '三千人民币。': '/audio/examples/ex_14d6792b8fee.mp3',
  '上午我去银行。': '/audio/examples/ex_f3d29cff312f.mp3',
  '上午我很忙。': '/audio/examples/ex_b63a4ebd2ff2.mp3',
  '下午我去图书馆。': '/audio/examples/ex_49d9ab28ba9e.mp3',
  '二百美元。': '/audio/examples/ex_b053f81ff218.mp3',
  '人民币的汇率是多少？': '/audio/examples/ex_b43485c27894.mp3',
  '今天下午天气很好。': '/audio/examples/ex_d861e7011aae.mp3',
  '今天卖了一万块。': '/audio/examples/ex_254a1d41e4e5.mp3',
  '他一会儿就回来。': '/audio/examples/ex_f393e9399344.mp3',
  '他买了一百个苹果。': '/audio/examples/ex_73c61c62b612.mp3',
  '他在图书馆看书。': '/audio/examples/ex_8b9509d7e193.mp3',
  '他在数苹果。': '/audio/examples/ex_e83560c78a8d.mp3',
  '他换港币。': '/audio/examples/ex_e217ffba2359.mp3',
  '他有很多日元。': '/audio/examples/ex_87db8b81d3d4.mp3',
  '他花了五千块钱。': '/audio/examples/ex_d6ebed88ac66.mp3',
  '你去不去图书馆？': '/audio/examples/ex_4afcf87d6101.mp3',
  '你去图书馆吗？': '/audio/examples/ex_a233cf2e6a03.mp3',
  '你去韩国要换韩元。': '/audio/examples/ex_e80896b4c699.mp3',
  '你想不想吃苹果？': '/audio/examples/ex_2d8b0931b4f5.mp3',
  '你换什么钱？': '/audio/examples/ex_315353f869e2.mp3',
  '你数一下钱。': '/audio/examples/ex_c982e84c2718.mp3',
  '你有没有人民币？': '/audio/examples/ex_025ee1515f1d.mp3',
  '你有美元吗？': '/audio/examples/ex_ebae8b52875e.mp3',
  '你等我一下。': '/audio/examples/ex_d6ab6026e59d.mp3',
  '先生，给您钱。': '/audio/examples/ex_e3583eb889c8.mp3',
  '图书馆里很安静。': '/audio/examples/ex_e2f07134c61e.mp3',
  '小姐，我换钱。': '/audio/examples/ex_236f015ed520.mp3',
  '小姐，请等一下。': '/audio/examples/ex_7de513efb5d4.mp3',
  '我一会儿就去。': '/audio/examples/ex_a00aa1c53d5e.mp3',
  '我们在外面等你。': '/audio/examples/ex_c0199e52ac2d.mp3',
  '我们在外面聊一会儿天。': '/audio/examples/ex_d1561ee5e722.mp3',
  '我很累，我想休息一会儿。': '/audio/examples/ex_fa1201d022a0.mp3',
  '我想换一点港币。': '/audio/examples/ex_e8eafa4916c9.mp3',
  '我想换人民币。': '/audio/examples/ex_8ecff5456fa2.mp3',
  '我换二百美元。': '/audio/examples/ex_889c5e760e53.mp3',
  '我换人民币。': '/audio/examples/ex_251105d555b4.mp3',
  '我有一百块钱。': '/audio/examples/ex_69409f1d5ce4.mp3',
  '我要去银行换钱。': '/audio/examples/ex_705117fdaa0d.mp3',
  '日元换人民币。': '/audio/examples/ex_2e8547e23b54.mp3',
  '日元现在便宜吗？': '/audio/examples/ex_8faa4de51f94.mp3',
  '明天上午我们去上课。': '/audio/examples/ex_10e86d236f9a.mp3',
  '明天下午你有空吗？': '/audio/examples/ex_372685d6b196.mp3',
  '欧元很贵。': '/audio/examples/ex_2d1c0d433c8e.mp3',
  '欧元换人民币。': '/audio/examples/ex_55afd3eef206.mp3',
  '港币怎么换？': '/audio/examples/ex_3d44e3d2e699.mp3',
  '王先生在家吗？': '/audio/examples/ex_488c71c48616.mp3',
  '美元比人民币贵。': '/audio/examples/ex_368bc17827a8.mp3',
  '营业员在银行工作。': '/audio/examples/ex_838e10c5269e.mp3',
  '请坐一会儿。': '/audio/examples/ex_d21e54090bdc.mp3',
  '请数数。': '/audio/examples/ex_4b2274706a96.mp3',
  '请等一会儿。': '/audio/examples/ex_0694c988bbdd.mp3',
  '请问营业员在哪里？': '/audio/examples/ex_2003b6d35084.mp3',
  '这个房子要一百万。': '/audio/examples/ex_ebfb0ff5caf2.mp3',
  '这个手机一千块。': '/audio/examples/ex_91c94433a1fb.mp3',
  '这位先生是谁？': '/audio/examples/ex_f96d3b0f6c53.mp3',
  '这是五十欧元。': '/audio/examples/ex_f60388fb0183.mp3',
  '这是人民币。': '/audio/examples/ex_b175ab28b37b.mp3',
  '那个营业员很热情。': '/audio/examples/ex_837736b291ce.mp3',
  '那位小姐是谁？': '/audio/examples/ex_5eea185122d5.mp3',
  '韩元不值钱。': '/audio/examples/ex_378a45db82e0.mp3',
  '韩元换人民币。': '/audio/examples/ex_fec49191a06b.mp3',
};

/* =========================================================
   3. GRAMMAR DATA
   ========================================================= */
const GRAMMAR_DATA = [
  {
    title: '1. Câu hỏi chính phản (V不V)',
    formula: 'S + V + 不 + V (+ Tân ngữ)? ≈ S + V (+ Tân ngữ) + 吗?',
    desc: 'Dùng để hỏi xác nhận "Có ... không?". Chú ý: Tuyệt đối KHÔNG dùng đồng thời cả kết cấu "V不V" và từ nghi vấn "吗".',
    ex: [
      { zh: '你去不去图书馆？', py: 'Nǐ qù bú qù túshūguǎn?', vn: 'Bạn có đi thư viện không?' },
      { zh: '你去图书馆吗？', py: 'Nǐ qù túshūguǎn ma?', vn: 'Bạn đi thư viện không?' },
      { zh: '你想不想吃苹果？', py: 'Nǐ xiǎng bù xiǎng chī píngguǒ?', vn: 'Bạn có muốn ăn táo không?' },
      { zh: '你有没有人民币？', py: 'Nǐ yǒu méi yǒu rénmínbì?', vn: 'Bạn có nhân dân tệ không?' }
    ]
  },
  {
    title: '2. Động từ + 一会儿 (yíhuìr)',
    formula: 'S + V + 一会儿 (+ Tân ngữ)?',
    desc: '一会儿 (yíhuìr) biểu thị khoảng thời gian ngắn ("một lát, một chốc, một lúc"). Đặt sau động từ làm bổ ngữ thời lượng.',
    ex: [
      { zh: '请等一会儿。', py: 'Qǐng děng yíhuìr.', vn: 'Xin đợi một lát.' },
      { zh: '我很累，我想休息一会儿。', py: 'Wǒ hěn lèi, wǒ xiǎng xiūxi yíhuìr.', vn: 'Tôi rất mệt, tôi muốn nghỉ ngơi một lát.' },
      { zh: '请坐一会儿。', py: 'Qǐng zuò yíhuìr.', vn: 'Xin mời ngồi một lát.' },
      { zh: '我们在外面聊一会儿天。', py: 'Wǒmen zài wàimiàn liáo yíhuìr tiān.', vn: 'Chúng ta ở bên ngoài trò chuyện một lát.' }
    ]
  }
];

/* =========================================================
   4. EXERCISES DATA
   ========================================================= */
const EX1_DATA = [
  { text: '下午我去图书馆，你去 ___ 去？', py: 'Xiàwǔ wǒ qù túshūguǎn, nǐ qù ___ qù?', ans: '不', opt: ['不', '没', '吗', '呢'] },
  { text: '我要去银行换 ___ 。', py: 'Wǒ yào qù yínháng huàn ___ .', ans: '钱', opt: ['钱', '书', '苹果', '电视'] },
  { text: '您换 ___ 钱？', py: 'Nín huàn ___ qián?', ans: '什么', opt: ['什么', '怎么', '哪', '谁'] },
  { text: '请等一 ___ 。', py: 'Qǐng děng yí ___ .', ans: '会儿', opt: ['会儿', '点', '下', '些'] },
  { text: '先生，给您钱。请 ___ 。', py: 'Xiānsheng, gěi nín qián. Qǐng ___ .', ans: '数数', opt: ['数数', '换换', '等等', '看看'] }
];

const EX2_DATA = [
  { q: '你去 ___ 去图书馆？', py: 'Nǐ qù ___ qù túshūguǎn?', opts: [{ t: '不', p: 'bú' }, { t: '没', p: 'méi' }, { t: '吗', p: 'ma' }, { t: '的', p: 'de' }], ans: 0 },
  { q: '我想换二百 ___ 。', py: 'Wǒ xiǎng huàn èrbǎi ___ .', opts: [{ t: '美元', p: 'měiyuán' }, { t: '人民币', p: 'rénmínbì' }, { t: '港币', p: 'gǎngbì' }, { t: '欧元', p: 'ōuyuán' }], ans: 0 },
  { q: '请等一 ___ 。', py: 'Qǐng děng yí ___ .', opts: [{ t: '下', p: 'xià' }, { t: '会儿', p: 'huìr' }, { t: '点', p: 'diǎn' }, { t: '些', p: 'xiē' }], ans: 1 },
  { q: '他要去银行 ___ 钱。', py: 'Tā yào qù yínháng ___ qián.', opts: [{ t: '换', p: 'huàn' }, { t: '数', p: 'shǔ' }, { t: '等', p: 'děng' }, { t: '去', p: 'qù' }], ans: 0 },
  { q: '营业员说：先生，给您钱。请 ___ 。', py: 'Yíngyèyuán shuō: Xiānsheng, gěi nín qián. Qǐng ___ .', opts: [{ t: '数数', p: 'shǔshu' }, { t: '换钱', p: 'huànqián' }, { t: '休息', p: 'xiūxi' }, { t: '看看', p: 'kànkàn' }], ans: 0 }
];

const EX3_DATA = [
  { 
    words: [{ t: '下午', p: 'Xiàwǔ' }, { t: '我', p: 'wǒ' }, { t: '去', p: 'qù' }, { t: '图书馆', p: 'túshūguǎn' }, { t: '。', p: '' }], 
    ans: '下午我去图书馆。', 
    hint: 'Buổi chiều tôi đi thư viện.' 
  },
  { 
    words: [{ t: '我', p: 'Wǒ' }, { t: '换', p: 'huàn' }, { t: '二百', p: 'èrbǎi' }, { t: '美元', p: 'měiyuán' }, { t: '。', p: '' }], 
    ans: '我换二百美元。', 
    hint: 'Tôi đổi hai trăm đô la Mỹ.' 
  },
  { 
    words: [{ t: '请', p: 'Qǐng' }, { t: '等', p: 'děng' }, { t: '一会儿', p: 'yíhuìr' }, { t: '。', p: '' }], 
    ans: '请等一会儿。', 
    hint: 'Xin đợi một lát.' 
  },
  { 
    words: [{ t: '我', p: 'Wǒ' }, { t: '要', p: 'yào' }, { t: '去', p: 'qù' }, { t: '银行', p: 'yínháng' }, { t: '换钱', p: 'huànqián' }, { t: '。', p: '' }], 
    ans: '我要去银行换钱。', 
    hint: 'Tôi muốn đi ngân hàng đổi tiền.' 
  },
  { 
    words: [{ t: '你', p: 'Nǐ' }, { t: '去', p: 'qù' }, { t: '不', p: 'bú' }, { t: '去', p: 'qù' }, { t: '图书馆', p: 'túshūguǎn' }, { t: '？', p: '' }], 
    ans: '你去不去图书馆？', 
    hint: 'Bạn có đi thư viện không?' 
  }
];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* Sound effects via Web Audio API */
let audioCtx: AudioContext | null = null;
function playSfx(type: 'click' | 'slash' | 'miss' | 'correct' | 'win') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const t = audioCtx.currentTime;

    if (type === 'click') {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'sine'; o.frequency.value = 650;
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.06, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(t); o.stop(t + 0.11);
    } else if (type === 'slash') {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(1200, t);
      o.frequency.exponentialRampToValueAtTime(280, t + 0.12);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(t); o.stop(t + 0.13);
    } else if (type === 'miss') {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(200, t);
      o.frequency.exponentialRampToValueAtTime(80, t + 0.25);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.08, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(t); o.stop(t + 0.26);
    } else if (type === 'correct') {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(523, t);
      o.frequency.setValueAtTime(659, t + 0.08);
      o.frequency.setValueAtTime(784, t + 0.16);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.1, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(t); o.stop(t + 0.32);
    } else if (type === 'win') {
      const notes = [523, 659, 784, 1046];
      notes.forEach((f, i) => {
        if (!audioCtx) return;
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = 'triangle';
        o.frequency.value = f;
        const st = t + i * 0.1;
        g.gain.setValueAtTime(0.001, st);
        g.gain.linearRampToValueAtTime(0.1, st + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, st + 0.2);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(st); o.stop(st + 0.22);
      });
    }
  } catch {
    // AudioContext blocked or not available
  }
}

/* =========================================================
   5. SPEECH SYNTHESIS ENGINE & DUAL VOICE MANAGEMENT
   ========================================================= */
export default function App() {
  const [activeTab, setActiveTab] = useState<'vocab' | 'dialogue' | 'grammar' | 'write' | 'game' | 'ex1' | 'ex2' | 'ex3'>('vocab');
  
  // Audio state
  const [speechRate, setSpeechRate] = useState<number>(0.85);
  const [activeSpeakingText, setActiveSpeakingText] = useState<string | null>(null);

  // Available voices & unified dialogue voice selection
  const [chineseVoices, setChineseVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [dialogueVoiceName, setDialogueVoiceName] = useState<string>('');
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);

  // Active audio element ref for remote/fallback playback
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Vocab state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [activeSpeakingWordIdx, setActiveSpeakingWordIdx] = useState<number | null>(null);
  const [isPlayingAllVocab, setIsPlayingAllVocab] = useState<boolean>(false);

  // Dialogue state
  const [currentDlgHighlight, setCurrentDlgHighlight] = useState<number | null>(null);
  const [isPlayingAllDialogue, setIsPlayingAllDialogue] = useState<boolean>(false);
  const [isPlayingMasterTape, setIsPlayingMasterTape] = useState<'dialogue' | 'vocab' | null>(null);
  const playAllAbortRef = useRef<boolean>(false);

  // Writing state
  const [selectedWordIdx, setSelectedWordIdx] = useState<number>(3); // Default '换'
  const [activeChar, setActiveChar] = useState<string>('换');
  const [brushColor, setBrushColor] = useState<string>('#3d3346');
  const [showTrace, setShowTrace] = useState<boolean>(false); // Ẩn chữ mẫu mặc định để ô viết gọn gàng, không bị rối
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const drawHistoryRef = useRef<ImageData[]>([]);
  const hanziWriterContainerRef = useRef<HTMLDivElement | null>(null);
  const hanziWriterInstanceRef = useRef<unknown>(null);

  // Game state
  const [gameMode, setGameMode] = useState<'ninja' | 'memory'>('ninja');

  // Exercise 1 state
  const [ex1Answers, setEx1Answers] = useState<Record<number, string>>({});
  const [ex1Checked, setEx1Checked] = useState<boolean>(false);
  const [ex1Score, setEx1Score] = useState<number>(0);

  // Exercise 2 state
  const [ex2Answers, setEx2Answers] = useState<Record<number, number>>({});

  // Exercise 3 state
  const [ex3Items, setEx3Items] = useState<{ pool: { t: string; p: string }[]; selected: string[] }[]>([]);
  const [ex3Checked, setEx3Checked] = useState<boolean>(false);
  const [ex3Score, setEx3Score] = useState<number>(0);

  /* Load and sort voices - Choose single best voice for entire dialogue */
  const loadAvailableVoices = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const all = window.speechSynthesis.getVoices() || [];
    
    // Filter Mandarin Chinese voices
    const zh = all.filter(v => {
      const l = (v.lang || '').toLowerCase().replace('_', '-');
      const n = (v.name || '').toLowerCase();
      const isCanto = ['sinji', 'cantonese', 'yue', 'zh-hk', 'zh_hk', 'hong kong'].some(b => l.includes(b) || n.includes(b));
      return !isCanto && (l.includes('zh') || n.includes('chinese') || n.includes('mandarin') || l.includes('cmn'));
    });

    setChineseVoices(zh);

    // Pick single best natural voice for entire dialogue
    const preferred = zh.find(v => {
      const n = v.name.toLowerCase();
      return ['xiaoxiao', 'google 普通话', 'ting-ting', 'tingting', 'huihui', 'yaoyao', 'yunxi', 'kangkang'].some(k => n.includes(k));
    });

    if (preferred) {
      setDialogueVoiceName(preferred.name);
    } else if (zh.length > 0) {
      setDialogueVoiceName(zh[0].name);
    }
  }, []);

  useEffect(() => {
    loadAvailableVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadAvailableVoices;
    }
  }, [loadAvailableVoices]);

  /* Stop all ongoing speech and audio */
  const stopAllAudio = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setActiveSpeakingText(null);
    setActiveSpeakingWordIdx(null);
    setIsPlayingAllDialogue(false);
    setIsPlayingAllVocab(false);
    setIsPlayingMasterTape(null);
    setCurrentDlgHighlight(null);
    playAllAbortRef.current = true;
  }, []);

  /**
   * Phát âm tự nhiên chuẩn xác:
   * Ánh xạ các từ đặc biệt khi sử dụng Web Speech fallback
   */
  const getSpeakableText = (raw: string): string => {
    const t = raw.trim();
    if (t === '数') return '暑';
    if (t === '请数数' || t === '请数数。') return '请暑数。';
    let s = raw;
    s = s.replace(/请数数/g, '请暑数');
    s = s.replace(/……+/g, '，');
    s = s.replace(/\.\.\.+/g, '，');
    return s;
  };

  /* Web Speech API fallback cho các câu ví dụ hoặc câu mở rộng */
  const fallbackWebSpeech = useCallback((rawText: string, rateOverride?: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const actualText = getSpeakableText(rawText);
    const u = new SpeechSynthesisUtterance(actualText);
    u.lang = 'zh-CN';
    u.pitch = 1.0;
    u.rate = rateOverride ?? speechRate;

    const v = chineseVoices.find(voice => voice.name === dialogueVoiceName) || chineseVoices[0];
    if (v) u.voice = v;

    setActiveSpeakingText(rawText);
    u.onend = () => setActiveSpeakingText(null);
    u.onerror = () => setActiveSpeakingText(null);

    window.speechSynthesis.speak(u);
  }, [chineseVoices, dialogueVoiceName, speechRate]);

  /* Phát âm 1 từ vựng theo băng gốc giáo trình 09-2 */
  const playVocabWord = useCallback((idx: number) => {
    const word = WORDS[idx];
    if (!word) return;
    stopAllAudio();
    playAllAbortRef.current = false;
    setActiveSpeakingText(word.h);
    setActiveSpeakingWordIdx(idx);

    const audioUrl = VOCAB_AUDIO_FILES[idx] || `/audio/vocab/word_${idx}.mp3`;
    const audio = new Audio(audioUrl);
    audio.playbackRate = Math.max(0.5, Math.min(2.0, speechRate));
    currentAudioRef.current = audio;

    audio.onended = () => {
      setActiveSpeakingText(null);
      setActiveSpeakingWordIdx(null);
      currentAudioRef.current = null;
    };
    audio.onerror = () => {
      fallbackWebSpeech(word.h);
    };
    audio.play().catch(() => {
      fallbackWebSpeech(word.h);
    });
  }, [stopAllAudio, speechRate, fallbackWebSpeech]);

  /* Phát âm 1 câu bài khóa theo băng gốc giáo trình 09-1 */
  const playDialogueLine = useCallback((idx: number) => {
    const line = DIALOGUE[idx];
    if (!line) return;
    stopAllAudio();
    playAllAbortRef.current = false;
    setActiveSpeakingText(line.zh);
    setCurrentDlgHighlight(idx);

    const audioUrl = DIALOGUE_AUDIO_FILES[idx] || `/audio/dialogue/line_${idx}.mp3`;
    const audio = new Audio(audioUrl);
    audio.playbackRate = Math.max(0.5, Math.min(2.0, speechRate));
    currentAudioRef.current = audio;

    audio.onended = () => {
      setActiveSpeakingText(null);
      setCurrentDlgHighlight(null);
      currentAudioRef.current = null;
    };
    audio.onerror = () => {
      fallbackWebSpeech(line.zh);
    };
    audio.play().catch(() => {
      fallbackWebSpeech(line.zh);
    });
  }, [stopAllAudio, speechRate, fallbackWebSpeech]);

  /**
   * Speak function:
   * - Tự động nhận diện từ vựng (đồng bộ 09-2)
   * - Tự động nhận diện câu bài khóa (đồng bộ 09-1)
   * - Fallback cho câu ví dụ
   */
  const speakText = useCallback((rawText: string, rateOverride?: number) => {
    stopAllAudio();
    playAllAbortRef.current = false;
    const trimmed = rawText.trim();
    const rate = Math.max(0.5, Math.min(2.0, rateOverride ?? speechRate));

    // 1. Kiểm tra từ vựng 09-2
    const vocabIdx = WORDS.findIndex(w => w.h === trimmed);
    if (vocabIdx >= 0) {
      playVocabWord(vocabIdx);
      return;
    }

    // 2. Kiểm tra câu bài khóa 09-1 (khớp chính xác)
    const dlgIdx = DIALOGUE.findIndex(d => 
      d.zh === trimmed || 
      d.zh.replace(/。/g, '，') === trimmed.replace(/。/g, '，')
    );
    if (dlgIdx >= 0) {
      playDialogueLine(dlgIdx);
      return;
    }

    // 3. Kiểm tra câu ví dụ mẫu trong bảng EXAMPLES_AUDIO_MAP (đồng bộ chuẩn 100%)
    const exampleUrl = 
      EXAMPLES_AUDIO_MAP[trimmed] || 
      EXAMPLES_AUDIO_MAP[trimmed + '。'] || 
      EXAMPLES_AUDIO_MAP[trimmed.replace(/。$/, '')] ||
      EXAMPLES_AUDIO_MAP[trimmed.replace(/？$/, '？')] ||
      DIALOGUE_AUDIO_MAP[trimmed] ||
      VOCAB_AUDIO_MAP[trimmed];

    if (exampleUrl) {
      setActiveSpeakingText(rawText);
      const audio = new Audio(exampleUrl);
      audio.playbackRate = rate;
      currentAudioRef.current = audio;
      audio.onended = () => {
        setActiveSpeakingText(null);
        currentAudioRef.current = null;
      };
      audio.onerror = () => fallbackWebSpeech(trimmed, rateOverride);
      audio.play().catch(() => fallbackWebSpeech(trimmed, rateOverride));
      return;
    }

    fallbackWebSpeech(rawText, rateOverride);
  }, [stopAllAudio, speechRate, playVocabWord, playDialogueLine, fallbackWebSpeech]);

  /* Phát toàn bộ bài khóa: Phát tuần tự 11 câu gốc từ băng 09-1 chuẩn xác, đồng bộ highlight */
  const playAllDialogue = useCallback(async () => {
    if (isPlayingAllDialogue) {
      stopAllAudio();
      return;
    }
    stopAllAudio();
    setIsPlayingAllDialogue(true);
    playAllAbortRef.current = false;

    for (let i = 0; i < DIALOGUE.length; i++) {
      if (playAllAbortRef.current) break;
      setCurrentDlgHighlight(i);
      setActiveSpeakingText(DIALOGUE[i].zh);

      await new Promise<void>((resolve) => {
        if (playAllAbortRef.current) return resolve();
        const audioUrl = DIALOGUE_AUDIO_FILES[i] || `/audio/dialogue/line_${i}.mp3`;
        const audio = new Audio(audioUrl);
        audio.playbackRate = speechRate;
        currentAudioRef.current = audio;

        audio.onended = () => {
          currentAudioRef.current = null;
          resolve();
        };
        audio.onerror = () => {
          currentAudioRef.current = null;
          resolve();
        };
        audio.play().catch(() => resolve());
      });

      if (playAllAbortRef.current) break;
      await new Promise(r => setTimeout(r, 450));
    }

    setCurrentDlgHighlight(null);
    setActiveSpeakingText(null);
    setIsPlayingAllDialogue(false);
  }, [isPlayingAllDialogue, speechRate, stopAllAudio]);

  /* Phát toàn bộ từ vựng: Phát tuần tự 19 từ gốc từ băng 09-2 chuẩn xác, đồng bộ thẻ highlight */
  const playAllVocab = useCallback(async () => {
    if (isPlayingAllVocab) {
      stopAllAudio();
      return;
    }
    stopAllAudio();
    setIsPlayingAllVocab(true);
    playAllAbortRef.current = false;

    for (let i = 0; i < WORDS.length; i++) {
      if (playAllAbortRef.current) break;
      setActiveSpeakingWordIdx(i);
      setActiveSpeakingText(WORDS[i].h);

      await new Promise<void>((resolve) => {
        if (playAllAbortRef.current) return resolve();
        const audioUrl = VOCAB_AUDIO_FILES[i] || `/audio/vocab/word_${i}.mp3`;
        const audio = new Audio(audioUrl);
        audio.playbackRate = speechRate;
        currentAudioRef.current = audio;

        audio.onended = () => {
          currentAudioRef.current = null;
          resolve();
        };
        audio.onerror = () => {
          currentAudioRef.current = null;
          resolve();
        };
        audio.play().catch(() => resolve());
      });

      if (playAllAbortRef.current) break;
      await new Promise(r => setTimeout(r, 380));
    }

    setActiveSpeakingWordIdx(null);
    setActiveSpeakingText(null);
    setIsPlayingAllVocab(false);
  }, [isPlayingAllVocab, speechRate, stopAllAudio]);

  /* Phát toàn bộ băng cassette gốc giáo trình (09-1 bài khóa hoặc 09-2 từ vựng) với karaoke highlight */
  const playMasterTape = useCallback((type: 'dialogue' | 'vocab') => {
    if (isPlayingMasterTape === type) {
      stopAllAudio();
      return;
    }
    stopAllAudio();
    setIsPlayingMasterTape(type);
    playAllAbortRef.current = false;

    const url = type === 'dialogue' ? DIALOGUE_AUDIO_FULL : VOCAB_AUDIO_FULL;
    const audio = new Audio(url);
    audio.playbackRate = speechRate;
    currentAudioRef.current = audio;

    if (type === 'dialogue') {
      audio.ontimeupdate = () => {
        const cur = audio.currentTime;
        const lineIdx = DIALOGUE_TIMESTAMP_LIST.findIndex(t => cur >= t.start && cur <= t.end);
        setCurrentDlgHighlight(lineIdx >= 0 ? lineIdx : null);
      };
    } else {
      audio.ontimeupdate = () => {
        const cur = audio.currentTime;
        const wordIdx = VOCAB_TIMESTAMP_LIST.findIndex(t => cur >= t.start && cur <= t.end);
        setActiveSpeakingWordIdx(wordIdx >= 0 ? wordIdx : null);
      };
    }

    audio.onended = () => {
      setIsPlayingMasterTape(null);
      setCurrentDlgHighlight(null);
      setActiveSpeakingWordIdx(null);
      currentAudioRef.current = null;
    };
    audio.onerror = () => {
      setIsPlayingMasterTape(null);
      currentAudioRef.current = null;
    };
    audio.play().catch(() => {
      setIsPlayingMasterTape(null);
    });
  }, [isPlayingMasterTape, speechRate, stopAllAudio]);

  /* Init Exercise 3 pool */
  const resetEx3 = useCallback(() => {
    setEx3Items(EX3_DATA.map(item => ({
      pool: shuffleArray(item.words),
      selected: []
    })));
    setEx3Checked(false);
    setEx3Score(0);
  }, []);

  useEffect(() => {
    resetEx3();
  }, [resetEx3]);

  /* Hanzi Writer Integration */
  const initHanziWriter = useCallback((char: string) => {
    const container = hanziWriterContainerRef.current;
    if (!container) return;
    container.innerHTML = '';

    const win = window as unknown as { HanziWriter?: { create: (el: HTMLElement | string, char: string, options: Record<string, unknown>) => unknown } };
    if (win.HanziWriter) {
      const size = Math.min(380, container.clientWidth || 320);
      try {
        hanziWriterInstanceRef.current = win.HanziWriter.create(container, char, {
          width: size,
          height: size,
          padding: 8,
          showOutline: false, // Ẩn hoàn toàn chữ mẫu / nét mờ mặc định để ô viết sạch đẹp, không bị rối mắt
          showCharacter: false, // Ẩn hoàn toàn chữ mẫu
          strokeAnimationSpeed: 1.2,
          delayBetweenStrokes: 180,
          strokeColor: '#8a6bff',
          outlineColor: '#eddcf0'
        });
      } catch {
        // Fallback display if character data not found
      }
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'write') {
      initHanziWriter(activeChar);
    }
  }, [activeTab, activeChar, initHanziWriter]);

  /* Canvas Drawing Logic */
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 7;
      ctx.strokeStyle = brushColor;
    }
    drawHistoryRef.current = [];
  }, [brushColor]);

  useEffect(() => {
    if (activeTab === 'write') {
      setTimeout(setupCanvas, 100);
    }
  }, [activeTab, setupCanvas]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    canvas.setPointerCapture?.(e.pointerId);
    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    lastPosRef.current = { x, y };

    const ctx = canvas.getContext('2d');
    if (ctx) {
      try {
        drawHistoryRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        if (drawHistoryRef.current.length > 25) drawHistoryRef.current.shift();
      } catch {
        // Ignored
      }
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = brushColor;
      ctx.fill();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !lastPosRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = 7;
      ctx.stroke();
    }
    lastPosRef.current = { x, y };
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  const clearCanvas = () => {
    playSfx('click');
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        try {
          drawHistoryRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        } catch {
          // Ignored
        }
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
      }
    }
    const hw = hanziWriterInstanceRef.current as {
      hideCharacter?: () => void;
      hideOutline?: () => void;
    };
    if (hw) {
      if (typeof hw.hideCharacter === 'function') hw.hideCharacter();
      if (!showTrace && typeof hw.hideOutline === 'function') hw.hideOutline();
    }
  };

  const undoCanvas = () => {
    playSfx('click');
    const canvas = canvasRef.current;
    if (!canvas || drawHistoryRef.current.length === 0) return;
    const ctx = canvas.getContext('2d');
    const prev = drawHistoryRef.current.pop();
    if (ctx && prev) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.putImageData(prev, 0, 0);
      ctx.restore();
    }
  };

  const animateHanzi = () => {
    playSfx('click');
    const hw = hanziWriterInstanceRef.current as {
      animateCharacter?: (opts?: { onComplete?: () => void }) => void;
      hideCharacter?: () => void;
      hideOutline?: () => void;
      showOutline?: () => void;
    };
    if (hw && typeof hw.animateCharacter === 'function') {
      hw.animateCharacter({
        onComplete: () => {
          // Tự động ẩn nét sau khi chạy xong hoạt ảnh xem nét để ô viết không bị rối mắt
          setTimeout(() => {
            if (!showTrace && typeof hw.hideCharacter === 'function') {
              hw.hideCharacter();
              if (typeof hw.hideOutline === 'function') hw.hideOutline();
            }
          }, 1000);
        }
      });
    }
  };

  const toggleTrace = () => {
    playSfx('click');
    setShowTrace((prev) => {
      const next = !prev;
      const hw = hanziWriterInstanceRef.current as {
        showOutline?: () => void;
        hideOutline?: () => void;
        hideCharacter?: () => void;
      };
      if (hw) {
        if (next && typeof hw.showOutline === 'function') {
          hw.showOutline();
        } else {
          if (typeof hw.hideOutline === 'function') hw.hideOutline();
          if (typeof hw.hideCharacter === 'function') hw.hideCharacter();
        }
      }
      return next;
    });
  };

  // Filtered Vocab
  const filteredWords = WORDS.filter(w => {
    if (!searchTerm.trim()) return true;
    const t = searchTerm.trim().toLowerCase();
    return w.h.includes(t) || w.p.toLowerCase().includes(t) || w.m.toLowerCase().includes(t);
  });

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#fdf1f7] via-[#f4efff] to-[#eaf7f4] text-[#3d3346] pb-20 select-none overflow-x-hidden font-sans">
      {/* Decorative Pastel Background Blobs */}
      <div className="fixed -top-32 -left-32 w-96 h-96 rounded-full bg-[#ffd3e2] blur-3xl opacity-50 pointer-events-none animate-pulse" />
      <div className="fixed top-1/4 -right-40 w-96 h-96 rounded-full bg-[#d9cbff] blur-3xl opacity-50 pointer-events-none" />
      <div className="fixed -bottom-40 left-1/4 w-[30rem] h-[30rem] rounded-full bg-[#c3f2e2] blur-3xl opacity-50 pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-6">

        {/* HERO HEADER */}
        <header className="text-center py-4 mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#ffb3c6] to-[#c9b6ff] text-white font-bold text-xs tracking-widest shadow-md mb-3">
            <Sparkles className="w-3.5 h-3.5" /> BÀI 9 · 换钱 (ĐỔI TIỀN)
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-wider bg-gradient-to-r from-[#ff7fa3] via-[#a98bff] to-[#4fc3a1] bg-clip-text text-transparent drop-shadow-sm">
            换钱 · Đổi Tiền Tại Ngân Hàng
          </h1>
          <p className="mt-2 text-sm md:text-base text-[#7a6b88] font-medium">
            Phát âm chuẩn xác · Luyện viết chữ Hán · Ôn tập toàn diện tiếng Trung
          </p>
        </header>

        {/* NAVIGATION TABS */}
        <nav className="flex flex-wrap justify-center gap-2 mb-6">
          {[
            { id: 'vocab', label: 'Từ vựng', icon: BookOpen },
            { id: 'dialogue', label: 'Bài khóa', icon: MessageCircle },
            { id: 'grammar', label: 'Ngữ pháp', icon: GraduationCap },
            { id: 'write', label: 'Luyện viết', icon: PenTool },
            { id: 'game', label: 'Trò chơi', icon: Gamepad2 },
            { id: 'ex1', label: 'Bài tập 1', icon: Award },
            { id: 'ex2', label: 'Bài tập 2', icon: Award },
            { id: 'ex3', label: 'Bài tập 3', icon: RefreshCw },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playSfx('click');
                  setActiveTab(tab.id as typeof activeTab);
                  stopAllAudio();
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ff9dbb] to-[#a98bff] text-white shadow-md shadow-[#c9b6ff]/50 scale-105'
                    : 'bg-white/80 hover:bg-white text-[#7a6b88] hover:text-[#5d4d70] hover:-translate-y-0.5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* =========================================================================
            PANEL 1: 📚 VOCABULARY (TỪ VỰNG)
            ========================================================================= */}
        {activeTab === 'vocab' && (
          <section className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur-md shadow-sm border border-white/60">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a08fc4]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="🔍 Tìm chữ Hán, pinyin hoặc nghĩa tiếng Việt..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-[#f0e6f7] focus:border-[#c9b6ff] bg-white text-sm outline-none transition"
                />
              </div>

              {/* Controls & Speed */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#7a6b88] bg-[#f9f5ff] px-3.5 py-1.5 rounded-xl border border-[#ede3fc]">
                  <span>🐢</span>
                  <input
                    type="range"
                    min="0.5"
                    max="1.3"
                    step="0.05"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-20 accent-[#a98bff] cursor-pointer"
                  />
                  <span>🐇</span>
                  <span className="font-bold text-[#8a6bff] w-9 text-right">{speechRate.toFixed(2)}x</span>
                </div>

                {!isPlayingAllVocab ? (
                  <button
                    onClick={playAllVocab}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-[#e6dcff] hover:bg-[#d3c1ff] text-[#8a6bff] transition shadow-xs active:scale-95"
                    title="Phát tuần tự 19 từ vựng theo băng gốc 09-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Phát toàn bộ từ</span>
                  </button>
                ) : (
                  <button
                    onClick={stopAllAudio}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-[#ff9dbb] hover:bg-[#ff7fa3] text-white transition shadow-xs active:scale-95 animate-pulse"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Dừng phát</span>
                  </button>
                )}

                {isPlayingMasterTape !== 'vocab' ? (
                  <button
                    onClick={() => playMasterTape('vocab')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-white hover:bg-[#fbf7fe] text-[#7a6b88] border border-[#e6dcff] transition shadow-xs active:scale-95"
                    title="Nghe toàn bộ băng cassette gốc 09-2.mp3 (kèm lời dẫn bài học)"
                  >
                    <Headphones className="w-3.5 h-3.5 text-[#8a6bff]" />
                    <span className="hidden sm:inline">Băng gốc (09-2)</span>
                  </button>
                ) : (
                  <button
                    onClick={stopAllAudio}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-[#a98bff] hover:bg-[#9674ff] text-white transition shadow-xs active:scale-95 animate-pulse"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Dừng băng</span>
                  </button>
                )}
              </div>
            </div>

            {/* Vocab Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredWords.map((item) => {
                const actualIdx = WORDS.findIndex(w => w.h === item.h);
                const isFlipped = !!flippedCards[actualIdx];
                const isSpeaking = activeSpeakingWordIdx === actualIdx || activeSpeakingText === item.h;

                return (
                  <div
                    key={item.h}
                    className={`relative h-64 [perspective:1000px] cursor-pointer group rounded-2xl transition-all ${
                      isSpeaking ? 'ring-4 ring-[#ff9dbb] shadow-lg scale-102' : ''
                    }`}
                    onClick={() => {
                      setFlippedCards(prev => ({ ...prev, [actualIdx]: !prev[actualIdx] }));
                    }}
                  >
                    <div
                      className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform rounded-2xl ${
                        isFlipped ? '[transform:rotateY(180deg)]' : ''
                      }`}
                    >
                      {/* FRONT FACE */}
                      <div className="absolute inset-0 [backface-visibility:hidden] p-5 rounded-2xl bg-white/90 backdrop-blur-md border-2 border-white shadow-sm flex flex-col justify-between hover:shadow-md transition">
                        <div>
                          <div className="flex items-start justify-between">
                            <span className="text-3xl font-extrabold tracking-wide bg-gradient-to-br from-[#ff7fa3] to-[#9b7bff] bg-clip-text text-transparent">
                              {item.h}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                playSfx('click');
                                playVocabWord(actualIdx);
                              }}
                              className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-sm ${
                                isSpeaking
                                  ? 'bg-[#a98bff] text-white animate-pulse'
                                  : 'bg-gradient-to-br from-[#ffe3ee] to-[#e6dcff] text-[#8a6bff] hover:bg-[#d3c1ff]'
                              }`}
                              title="Nghe phát âm chuẩn từ băng gốc 09-2"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-base font-bold text-[#8b7bb8] mt-2 tracking-wide font-mono">
                            {item.p}
                          </div>
                          <div className="text-sm text-[#5d4d70] mt-1 font-medium">
                            {item.m}
                          </div>
                        </div>

                        <div className="text-[11px] font-semibold text-[#b5a3db] flex items-center gap-1.5 pt-3 border-t border-[#f4eef9]">
                          <span className="w-2 h-2 rounded-full bg-[#ffb3c6] animate-ping" />
                          Nhấn để lật thẻ xem ví dụ
                        </div>
                      </div>

                      {/* BACK FACE */}
                      <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] p-4 rounded-2xl bg-gradient-to-br from-[#fff8fc] to-[#f4f0ff] border-2 border-white shadow-sm overflow-y-auto flex flex-col justify-between">
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-wider text-[#a98bff] mb-2 flex items-center justify-between">
                            <span>📖 Ví dụ minh họa</span>
                            <span className="text-[10px] text-[#b5a3db]">Nhấp câu để nghe</span>
                          </div>
                          <div className="space-y-2">
                            {item.ex.map((e, eIdx) => (
                              <div
                                key={eIdx}
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  playSfx('click');
                                  speakText(e[0]);
                                }}
                                className="pl-2.5 border-l-2 border-[#ffd6e5] hover:border-[#a98bff] transition group/ex cursor-pointer"
                              >
                                <div className="text-xs font-bold text-[#4a3f55] group-hover/ex:text-[#8a6bff] flex items-center gap-1">
                                  <span>{e[0]}</span>
                                  <Volume2 className="w-3 h-3 opacity-60 group-hover/ex:opacity-100" />
                                </div>
                                <div className="text-[11px] text-[#9b90a8] italic">
                                  {e[1]}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="text-[10px] text-center font-bold text-[#c0aee0] mt-2">
                          Lật lại mặt trước ↩
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* =========================================================================
            PANEL 2: 💬 DIALOGUE (BÀI KHÓA - 2 GIỌNG ĐỌC KHÁC NHAU RÕ RỆT)
            ========================================================================= */}
        {activeTab === 'dialogue' && (
          <section className="max-w-3xl mx-auto p-6 rounded-3xl bg-white/85 backdrop-blur-md shadow-md border border-white/70 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#f0e6f7]">
              <div>
                <h2 className="text-xl font-black text-[#5d4d70]">
                  在中国银行换钱 · Đổi tiền tại Ngân hàng Trung Quốc
                </h2>
                <p className="text-xs text-[#8d8298] mt-0.5">
                  Đồng bộ chuẩn 100% theo băng ghi âm giáo trình Bài 9 (09-1.mp3)
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {!isPlayingAllDialogue ? (
                  <button
                    onClick={playAllDialogue}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-[#e6dcff] hover:bg-[#d3c1ff] text-[#8a6bff] transition shadow-xs active:scale-95"
                    title="Phát tuần tự 11 câu hội thoại từ băng gốc 09-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Phát toàn bộ</span>
                  </button>
                ) : (
                  <button
                    onClick={stopAllAudio}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-[#ff9dbb] hover:bg-[#ff7fa3] text-white transition shadow-xs active:scale-95 animate-pulse"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Dừng phát</span>
                  </button>
                )}

                {isPlayingMasterTape !== 'dialogue' ? (
                  <button
                    onClick={() => playMasterTape('dialogue')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-white hover:bg-[#fbf7fe] text-[#7a6b88] border border-[#e6dcff] transition shadow-xs active:scale-95"
                    title="Nghe toàn bộ băng cassette gốc 09-1.mp3 (kèm lời dẫn bài khóa)"
                  >
                    <Headphones className="w-3.5 h-3.5 text-[#8a6bff]" />
                    <span className="hidden sm:inline">Băng gốc (09-1)</span>
                  </button>
                ) : (
                  <button
                    onClick={stopAllAudio}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-[#a98bff] hover:bg-[#9674ff] text-white transition shadow-xs active:scale-95 animate-pulse"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Dừng băng</span>
                  </button>
                )}

                <button
                  onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                  className="p-2 rounded-xl text-xs font-bold bg-white text-[#7a6b88] hover:bg-[#f9f5ff] border border-[#f0e6f7] transition flex items-center gap-1 shadow-xs"
                  title="Tùy chỉnh giọng đọc"
                >
                  <Settings2 className="w-4 h-4 text-[#8a6bff]" />
                </button>
              </div>
            </div>

            {/* Voice Customization Drawer */}
            {showVoiceSettings && (
              <div className="p-4 rounded-2xl bg-[#faf7ff] border border-[#ede3fc] space-y-3">
                <div className="text-xs font-black uppercase text-[#8a6bff] tracking-wider flex items-center justify-between">
                  <span>🎙️ Cài đặt giọng đọc bài khóa:</span>
                  <span className="text-[11px] text-[#9b90a8] font-normal">Sử dụng cùng 1 giọng đọc xuyên suốt toàn bộ hội thoại</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#f0e6f7] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-[#5d4d70] mb-1">
                      Chọn giọng đọc tiếng Trung (Mandarin):
                    </label>
                    <select
                      value={dialogueVoiceName}
                      onChange={(e) => setDialogueVoiceName(e.target.value)}
                      className="w-full p-2 rounded-lg border border-[#e6dcff] bg-white font-medium text-xs text-[#4a3f55] outline-none"
                    >
                      {chineseVoices.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => speakText('先生，我换人民币。请等一会儿。')}
                    className="self-end sm:self-center px-4 py-2.5 rounded-xl bg-[#e6dcff] hover:bg-[#d3c1ff] text-[#8a6bff] font-bold text-xs transition shadow-sm active:scale-95 shrink-0"
                  >
                    🔊 Thử giọng
                  </button>
                </div>
              </div>
            )}

            {/* Dialogue Lines */}
            <div className="space-y-3">
              {DIALOGUE.map((line, idx) => {
                const isHighlight = currentDlgHighlight === idx;
                const isSpeakingThis = activeSpeakingText === line.zh;

                // Color themes by role
                const avatarBg = line.role === 'A' ? 'bg-[#ff9dbb]' : line.role === 'B' ? 'bg-[#a98bff]' : 'bg-[#4fc3a1]';

                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3.5 p-3.5 rounded-2xl transition-all ${
                      isHighlight || isSpeakingThis
                        ? 'bg-[#ffeef4] border-2 border-[#ffb3c6] shadow-sm translate-x-1'
                        : 'bg-white/60 hover:bg-white/90 border border-transparent'
                    }`}
                  >
                    {/* Role Avatar */}
                    <div className={`w-10 h-10 rounded-full ${avatarBg} text-white font-extrabold flex items-center justify-center shrink-0 shadow-sm text-sm`}>
                      {line.role}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-black uppercase text-[#9b90a8] tracking-wider">
                          {line.roleName}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            playSfx('click');
                            playDialogueLine(idx);
                          }}
                          className={`p-1.5 rounded-full transition ${
                            isSpeakingThis || isHighlight ? 'text-[#ff7fa3] animate-pulse' : 'text-[#a08fc4] hover:text-[#8a6bff]'
                          }`}
                          title="Bấm để nghe câu này từ băng gốc 09-1"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Clickable Chinese text */}
                      <div
                        onClick={() => {
                          playSfx('click');
                          playDialogueLine(idx);
                        }}
                        className="text-base md:text-lg font-bold cursor-pointer transition inline-block text-[#4a3f55] hover:text-[#a98bff]"
                      >
                        {line.zh}
                      </div>

                      <div className="text-xs font-semibold text-[#8b7bb8] font-mono mt-0.5">
                        {line.py}
                      </div>
                      <div className="text-xs text-[#7a6b88] italic mt-0.5">
                        {line.vn}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* =========================================================================
            PANEL 3: 📐 GRAMMAR (NGỮ PHÁP)
            ========================================================================= */}
        {activeTab === 'grammar' && (
          <section className="max-w-3xl mx-auto space-y-6">
            {GRAMMAR_DATA.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white/90 backdrop-blur-md shadow-md border-t-4 border-[#a98bff] space-y-3"
              >
                <h3 className="text-lg font-black text-[#5d4d70]">
                  {item.title}
                </h3>
                <div className="inline-block px-3.5 py-1.5 rounded-xl bg-[#f3edff] text-[#8a6bff] font-bold text-sm border border-dashed border-[#c9b6ff]">
                  {item.formula}
                </div>
                <p className="text-xs md:text-sm text-[#7a6b88] leading-relaxed">
                  {item.desc}
                </p>

                <div className="pt-2 space-y-2">
                  <div className="text-xs font-black uppercase text-[#a98bff] tracking-wider">
                    Ví dụ câu mẫu:
                  </div>
                  {item.ex.map((e, eIdx) => (
                    <div
                      key={eIdx}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#fdfafc] border border-[#f0e6f7] hover:border-[#c9b6ff] transition"
                    >
                      <div>
                        <div className="text-sm font-bold text-[#4a3f55]">{e.zh}</div>
                        <div className="text-xs text-[#a08fc4] font-mono mt-0.5">{e.py}</div>
                        <div className="text-xs text-[#8d8298] italic mt-0.5">{e.vn}</div>
                      </div>
                      <button
                        onClick={() => {
                          playSfx('click');
                          speakText(e.zh);
                        }}
                        className="w-8 h-8 rounded-full bg-[#e6dcff] hover:bg-[#d3c1ff] text-[#8a6bff] flex items-center justify-center transition hover:scale-110 active:scale-95 shrink-0 ml-3 shadow-sm"
                        title="Nghe câu ví dụ"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* =========================================================================
            PANEL 4: ✍️ WRITING (LUYỆN VIẾT CHỮ HÁN VỚI HANZI WRITER & BẢNG VẼ)
            ========================================================================= */}
        {activeTab === 'write' && (
          <section className="max-w-4xl mx-auto space-y-6">
            {/* Word selector card */}
            <div className="p-5 rounded-3xl bg-white/85 backdrop-blur-md shadow-sm border border-white/80 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#7a6b88] flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[#a98bff]" /> CHỌN TỪ ĐỂ LUYỆN TẬP VIẾT NÉT:
              </h3>
              <select
                value={selectedWordIdx}
                onChange={(e) => {
                  const idx = parseInt(e.target.value, 10);
                  setSelectedWordIdx(idx);
                  const firstChar = Array.from(WORDS[idx].h)[0];
                  setActiveChar(firstChar);
                  clearCanvas();
                  speakText(WORDS[idx].h);
                }}
                className="w-full max-w-md p-2.5 rounded-xl border-2 border-[#f0e6f7] focus:border-[#c9b6ff] bg-white font-bold text-sm text-[#4a3f55] outline-none cursor-pointer"
              >
                {WORDS.map((w, i) => (
                  <option key={i} value={i}>
                    {w.h} ({w.p}) — {w.m}
                  </option>
                ))}
              </select>

              {/* Sub-character chips for multi-character words */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs font-bold text-[#8d8298]">Chọn chữ Hán luyện viết:</span>
                {Array.from(WORDS[selectedWordIdx].h).map((char, cIdx) => (
                  <button
                    key={cIdx}
                    onClick={() => {
                      playSfx('click');
                      setActiveChar(char);
                      clearCanvas();
                      speakText(char);
                    }}
                    className={`w-12 h-12 rounded-xl text-2xl font-bold flex items-center justify-center transition shadow-sm font-serif ${
                      activeChar === char
                        ? 'bg-gradient-to-r from-[#ff9dbb] to-[#a98bff] text-white scale-105 shadow-[#c9b6ff]/50'
                        : 'bg-white hover:bg-[#fbf7fe] text-[#5d4d70] border border-[#f0e6f7]'
                    }`}
                  >
                    {char}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => speakText(activeChar)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#ffe3ee] text-[#ff7fa3] hover:bg-[#ffd1e3] transition flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Nghe phát âm
                </button>
                <button
                  onClick={animateHanzi}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#e6dcff] text-[#8a6bff] hover:bg-[#d3c1ff] transition flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Xem thứ tự nét viết
                </button>
                <button
                  onClick={() => {
                    playSfx('click');
                    const rand = Math.floor(Math.random() * WORDS.length);
                    setSelectedWordIdx(rand);
                    const ch = Array.from(WORDS[rand].h)[0];
                    setActiveChar(ch);
                    clearCanvas();
                    speakText(WORDS[rand].h);
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-[#7a6b88] hover:bg-gray-100 transition flex items-center gap-1.5 border border-[#f0e6f7]"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Ngẫu nhiên từ khác
                </button>
              </div>
            </div>

            {/* Drawing Stage & Controls */}
            <div className="flex flex-wrap justify-center gap-6 items-start">
              {/* Tianzige Stage */}
              <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-3xl bg-white shadow-lg overflow-hidden border-4 border-white select-none">
                {/* Traditional Mizige (米字格) SVG Grid */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                  <rect x="1" y="1" width="98" height="98" fill="none" stroke="#ffb3c6" strokeWidth="1.2" />
                  <line x1="50" y1="1" x2="50" y2="99" stroke="#ffd0de" strokeWidth="0.8" strokeDasharray="3 3" />
                  <line x1="1" y1="50" x2="99" y2="50" stroke="#ffd0de" strokeWidth="0.8" strokeDasharray="3 3" />
                  <line x1="1" y1="1" x2="99" y2="99" stroke="#ffe8f0" strokeWidth="0.6" strokeDasharray="3 3" />
                  <line x1="99" y1="1" x2="1" y2="99" stroke="#ffe8f0" strokeWidth="0.6" strokeDasharray="3 3" />
                </svg>

                {/* HanziWriter animation target */}
                <div
                  ref={hanziWriterContainerRef}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                />

                {/* Interactive Drawing Canvas */}
                <canvas
                  ref={canvasRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  className="absolute inset-0 w-full h-full cursor-crosshair touch-none z-20"
                />
              </div>

              {/* Side Tools */}
              <div className="w-full sm:w-72 p-5 rounded-3xl bg-white/85 backdrop-blur-md shadow-sm border border-white space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#7a6b88]">
                  🖌️ Bút viết & Màu mực:
                </h4>

                {/* Swatches */}
                <div className="flex items-center gap-2.5">
                  {[
                    { color: '#3d3346', label: 'Đen truyền thống' },
                    { color: '#ff7fa3', label: 'Hồng pastel' },
                    { color: '#a98bff', label: 'Tím lavender' },
                    { color: '#4fc3a1', label: 'Xanh ngọc' },
                    { color: '#ffa726', label: 'Cam hoàng hôn' },
                  ].map((s) => (
                    <button
                      key={s.color}
                      onClick={() => setBrushColor(s.color)}
                      style={{ backgroundColor: s.color }}
                      className={`w-7 h-7 rounded-full border-2 border-white shadow-sm transition hover:scale-110 ${
                        brushColor === s.color ? 'ring-2 ring-[#a98bff] scale-110' : ''
                      }`}
                      title={s.label}
                    />
                  ))}
                </div>

                <div className="space-y-2 pt-2 border-t border-[#f0e6f7]">
                  <button
                    onClick={undoCanvas}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#eefaf6] text-[#2e8b6f] hover:bg-[#ddf6ed] transition flex items-center justify-center gap-2"
                  >
                    <Undo className="w-3.5 h-3.5" /> Hoàn tác nét vừa viết
                  </button>
                  <button
                    onClick={clearCanvas}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-gray-100 text-[#7a6b88] hover:bg-gray-200 transition flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Xóa sạch ô viết
                  </button>
                  <button
                    onClick={toggleTrace}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-white text-[#8a6bff] border border-[#ede3fc] hover:bg-[#fbf7fe] transition flex items-center justify-center gap-2"
                  >
                    {showTrace ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showTrace ? 'Ẩn chữ mẫu' : 'Hiện chữ mẫu mờ'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================================
            PANEL 5: 🎮 GAME (WORD NINJA & MEMORY)
            ========================================================================= */}
        {activeTab === 'game' && (
          <section className="max-w-3xl mx-auto space-y-4">
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  playSfx('click');
                  setGameMode('ninja');
                }}
                className={`px-5 py-2 rounded-full font-bold text-sm transition ${
                  gameMode === 'ninja'
                    ? 'bg-[#a98bff] text-white shadow-md shadow-[#c9b6ff]/50'
                    : 'bg-white/80 text-[#7a6b88] hover:bg-white'
                }`}
              >
                ⚔️ Word Ninja (Chém từ tiếng Trung)
              </button>
              <button
                onClick={() => {
                  playSfx('click');
                  setGameMode('memory');
                }}
                className={`px-5 py-2 rounded-full font-bold text-sm transition ${
                  gameMode === 'memory'
                    ? 'bg-[#a98bff] text-white shadow-md shadow-[#c9b6ff]/50'
                    : 'bg-white/80 text-[#7a6b88] hover:bg-white'
                }`}
              >
                🧠 Lật thẻ nhớ từ (Memory Game)
              </button>
            </div>

            {gameMode === 'ninja' && <NinjaGame speakText={speakText} playSfx={playSfx} />}
            {gameMode === 'memory' && <MemoryGame speakText={speakText} playSfx={playSfx} />}
          </section>
        )}

        {/* =========================================================================
            PANEL 6: 📝 EXERCISE 1 (ĐIỀN TỪ)
            ========================================================================= */}
        {activeTab === 'ex1' && (
          <section className="max-w-2xl mx-auto p-6 rounded-3xl bg-white/85 backdrop-blur-md shadow-md border border-white space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0e6f7]">
              <div>
                <h3 className="text-lg font-black text-[#5d4d70]">📝 Bài tập 1: Điền từ thích hợp</h3>
                <p className="text-xs text-[#8d8298]">Chọn từ đúng để hoàn thành câu hoàn chỉnh</p>
              </div>
              <div className="px-3.5 py-1 rounded-xl bg-[#f3edff] text-[#8a6bff] font-black text-sm">
                Điểm: {ex1Score}/{EX1_DATA.length}
              </div>
            </div>

            {/* Word bank */}
            <div className="p-3.5 rounded-2xl bg-[#fbf9fe] border border-[#f0e6f7] space-y-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#a98bff]">
                📦 Bảng từ gợi ý:
              </span>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(EX1_DATA.flatMap(d => d.opt))).map((w, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-white border border-[#e6dcff] text-xs font-bold text-[#5d4d70] shadow-2xs">
                    {w}
                  </span>
                ))}
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-3">
              {EX1_DATA.map((item, idx) => {
                const parts = item.text.split('___');
                const userVal = ex1Answers[idx] || '';
                const isCorrect = ex1Checked && userVal === item.ans;
                const isWrong = ex1Checked && userVal !== '' && userVal !== item.ans;

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border-2 transition ${
                      isCorrect
                        ? 'bg-[#f0faf6] border-[#7fdcc0]'
                        : isWrong
                        ? 'bg-[#fff4f8] border-[#ff7fa3]'
                        : 'bg-white/70 border-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-bold text-[#4a3f55]">
                      <span className="w-6 h-6 rounded-full bg-[#f0e6f7] text-[#8a6bff] flex items-center justify-center text-xs shrink-0">
                        {idx + 1}
                      </span>
                      <span>{parts[0]}</span>
                      <select
                        value={userVal}
                        onChange={(e) => {
                          setEx1Answers({ ...ex1Answers, [idx]: e.target.value });
                          setEx1Checked(false);
                        }}
                        className="mx-1 px-2.5 py-1 rounded-lg border-2 border-[#e6dcff] bg-white font-bold text-sm text-[#8a6bff] outline-none cursor-pointer"
                      >
                        <option value="">-- chọn --</option>
                        {item.opt.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                      <span>{parts[1]}</span>
                    </div>
                    <div className="text-xs text-[#a08fc4] font-mono mt-1 pl-8">
                      {item.py}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-3 pt-3">
              <button
                onClick={() => {
                  playSfx('click');
                  let score = 0;
                  EX1_DATA.forEach((item, idx) => {
                    if (ex1Answers[idx] === item.ans) score++;
                  });
                  setEx1Score(score);
                  setEx1Checked(true);
                  if (score === EX1_DATA.length) playSfx('win');
                  else playSfx('correct');
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#7fdcc0] to-[#4fc3a1] text-white shadow-sm hover:brightness-105 active:scale-95 transition"
              >
                Kiểm tra kết quả
              </button>
              <button
                onClick={() => {
                  playSfx('click');
                  setEx1Answers({});
                  setEx1Checked(false);
                  setEx1Score(0);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gray-100 text-[#7a6b88] hover:bg-gray-200 transition"
              >
                Làm lại
              </button>
            </div>
          </section>
        )}

        {/* =========================================================================
            PANEL 7: 📝 EXERCISE 2 (TRẮC NGHIỆM)
            ========================================================================= */}
        {activeTab === 'ex2' && (
          <section className="max-w-2xl mx-auto p-6 rounded-3xl bg-white/85 backdrop-blur-md shadow-md border border-white space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0e6f7]">
              <div>
                <h3 className="text-lg font-black text-[#5d4d70]">🎯 Bài tập 2: Trắc nghiệm kiến thức</h3>
                <p className="text-xs text-[#8d8298]">Chọn phương án chính xác nhất</p>
              </div>
              <div className="px-3.5 py-1 rounded-xl bg-[#f3edff] text-[#8a6bff] font-black text-sm">
                Điểm: {Object.keys(ex2Answers).filter(k => ex2Answers[parseInt(k)] === EX2_DATA[parseInt(k)].ans).length}/{EX2_DATA.length}
              </div>
            </div>

            <div className="space-y-4">
              {EX2_DATA.map((item, idx) => {
                const userChoice = ex2Answers[idx];
                const isAnswered = userChoice !== undefined;

                return (
                  <div key={idx} className="p-4 rounded-2xl bg-white/70 border border-white space-y-2">
                    <div className="text-sm font-bold text-[#4a3f55]">
                      <b>{idx + 1}.</b> {item.q}
                    </div>
                    <div className="text-xs text-[#a08fc4] font-mono italic">
                      {item.py}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {item.opts.map((opt, oIdx) => {
                        let btnStyle = 'bg-white border-[#f0e6f7] text-[#6f6180] hover:border-[#c9b6ff]';
                        if (isAnswered) {
                          if (oIdx === item.ans) {
                            btnStyle = 'bg-[#eafaf4] border-[#7fdcc0] text-[#2e8b6f] font-black';
                          } else if (userChoice === oIdx) {
                            btnStyle = 'bg-[#fff0f5] border-[#ff7fa3] text-[#c94a72] font-black';
                          } else {
                            btnStyle = 'bg-gray-50 border-gray-100 text-gray-400 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={isAnswered}
                            onClick={() => {
                              playSfx('click');
                              setEx2Answers({ ...ex2Answers, [idx]: oIdx });
                              if (oIdx === item.ans) playSfx('correct');
                              else playSfx('miss');
                            }}
                            className={`p-2.5 rounded-xl border-2 text-left transition flex flex-col ${btnStyle}`}
                          >
                            <span className="text-xs font-bold">
                              {String.fromCharCode(65 + oIdx)}. {opt.t}
                            </span>
                            <span className="text-[11px] text-[#a08fc4] font-mono">
                              {opt.p}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={() => {
                  playSfx('click');
                  setEx2Answers({});
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gray-100 text-[#7a6b88] hover:bg-gray-200 transition"
              >
                Làm lại từ đầu
              </button>
            </div>
          </section>
        )}

        {/* =========================================================================
            PANEL 8: 📝 EXERCISE 3 (SẮP XẾP TỪ THÀNH CÂU)
            ========================================================================= */}
        {activeTab === 'ex3' && (
          <section className="max-w-2xl mx-auto p-6 rounded-3xl bg-white/85 backdrop-blur-md shadow-md border border-white space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0e6f7]">
              <div>
                <h3 className="text-lg font-black text-[#5d4d70]">🧩 Bài tập 3: Sắp xếp từ thành câu đúng</h3>
                <p className="text-xs text-[#8d8298]">Nhấn chọn các mảnh từ theo đúng trật tự ngữ pháp</p>
              </div>
              <div className="px-3.5 py-1 rounded-xl bg-[#f3edff] text-[#8a6bff] font-black text-sm">
                Điểm: {ex3Score}/{EX3_DATA.length}
              </div>
            </div>

            <div className="space-y-4">
              {EX3_DATA.map((item, idx) => {
                const current = ex3Items[idx];
                if (!current) return null;
                const sentence = current.selected.join('');
                const isCorrect = ex3Checked && sentence === item.ans;
                const isWrong = ex3Checked && sentence !== item.ans;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border-2 transition space-y-2 ${
                      isCorrect
                        ? 'bg-[#f0faf6] border-[#7fdcc0]'
                        : isWrong
                        ? 'bg-[#fff4f8] border-[#ff7fa3]'
                        : 'bg-white/70 border-white'
                    }`}
                  >
                    <div className="text-xs font-semibold text-[#8d8298] italic">
                      Gợi ý nghĩa: {item.hint}
                    </div>

                    {/* Answer Drop Area */}
                    <div className="min-h-12 p-2 rounded-xl bg-white/90 border-2 border-dashed border-[#e6dcff] flex flex-wrap gap-2 items-center">
                      {current.selected.length === 0 ? (
                        <span className="text-xs text-[#b5a3db] italic">Nhấp vào từ bên dưới để đưa lên đây...</span>
                      ) : (
                        current.selected.map((w, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => {
                              playSfx('click');
                              const nextSel = [...current.selected];
                              nextSel.splice(sIdx, 1);
                              const nextItems = [...ex3Items];
                              nextItems[idx] = { ...current, selected: nextSel };
                              setEx3Items(nextItems);
                              setEx3Checked(false);
                            }}
                            className="px-3 py-1 rounded-lg bg-[#eafaf4] border border-[#7fdcc0] text-xs font-bold text-[#2e8b6f] hover:bg-[#ffeef4] hover:border-[#ff7fa3] hover:text-[#ff7fa3] transition shadow-2xs"
                            title="Nhấp để gỡ từ này"
                          >
                            {w}
                          </button>
                        ))
                      )}
                    </div>

                    {/* Word Pool */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {current.pool.map((w, pIdx) => {
                        const usedInSelected = current.selected.filter(x => x === w.t).length;
                        const poolOccurrences = current.pool.slice(0, pIdx + 1).filter(x => x.t === w.t).length;
                        const isUsed = usedInSelected >= poolOccurrences;

                        return (
                          <button
                            key={pIdx}
                            disabled={isUsed}
                            onClick={() => {
                              playSfx('click');
                              const nextItems = [...ex3Items];
                              nextItems[idx] = {
                                ...current,
                                selected: [...current.selected, w.t]
                              };
                              setEx3Items(nextItems);
                              setEx3Checked(false);
                            }}
                            className={`px-3 py-1 rounded-xl border text-xs font-bold flex flex-col items-center transition ${
                              isUsed
                                ? 'opacity-20 border-transparent bg-transparent pointer-events-none'
                                : 'bg-white border-[#f0e6f7] hover:border-[#c9b6ff] text-[#5d4d70] hover:-translate-y-0.5 shadow-2xs'
                            }`}
                          >
                            <span>{w.t}</span>
                            {w.p && <span className="text-[10px] text-[#a08fc4] font-mono">{w.p}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  playSfx('click');
                  let score = 0;
                  EX3_DATA.forEach((item, idx) => {
                    const current = ex3Items[idx];
                    if (current && current.selected.join('') === item.ans) {
                      score++;
                    }
                  });
                  setEx3Score(score);
                  setEx3Checked(true);
                  if (score === EX3_DATA.length) playSfx('win');
                  else playSfx('correct');
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#7fdcc0] to-[#4fc3a1] text-white shadow-sm hover:brightness-105 active:scale-95 transition"
              >
                Kiểm tra đáp án
              </button>
              <button
                onClick={() => {
                  playSfx('click');
                  resetEx3();
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gray-100 text-[#7a6b88] hover:bg-gray-200 transition"
              >
                Xáo trộn làm lại
              </button>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

/* =========================================================
   7. MINI GAME 1: WORD NINJA (CANVAS)
   ========================================================= */
interface NinjaProps {
  speakText: (t: string) => void;
  playSfx: (type: 'slash' | 'miss' | 'win' | 'click' | 'correct') => void;
}

function NinjaGame({ speakText, playSfx }: NinjaProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const [combo, setCombo] = useState<number>(0);

  const togglePause = () => {
    playSfx('click');
    setIsPaused((prev) => {
      const next = !prev;
      isPausedRef.current = next;
      if (!next) {
        gameStateRef.current.lastTime = performance.now();
      }
      return next;
    });
  };

  const gameStateRef = useRef({
    running: false,
    score: 0,
    lives: 3,
    fruits: [] as Array<{
      text: string;
      pinyin: string;
      radius: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      gravity: number;
      rotation: number;
      vr: number;
      color: number;
    }>,
    halves: [] as Array<{
      x: number;
      y: number;
      color: number;
      text: string;
      side: number;
      angle: number;
      vx: number;
      vy: number;
      gravity: number;
      rotation: number;
      vr: number;
      life: number;
    }>,
    particles: [] as Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: number;
      life: number;
      gravity: number;
      size: number;
    }>,
    trail: [] as Array<{ x: number; y: number; life: number }>,
    spawnTimer: 0,
    lastTime: 0,
    lastSliceTime: 0,
    combo: 0
  });

  const resetGame = () => {
    const s = gameStateRef.current;
    s.running = true;
    s.score = 0;
    s.lives = 3;
    s.fruits = [];
    s.halves = [];
    s.particles = [];
    s.trail = [];
    s.combo = 0;
    s.lastTime = performance.now();
    setScore(0);
    setLives(3);
    setIsGameOver(false);
    setIsPaused(false);
    isPausedRef.current = false;
    setCombo(0);
  };

  useEffect(() => {
    resetGame();
    let animId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = (time: number) => {
      const s = gameStateRef.current;
      if (!s.running) {
        animId = requestAnimationFrame(loop);
        return;
      }

      if (isPausedRef.current) {
        s.lastTime = time;
        animId = requestAnimationFrame(loop);
        return;
      }

      const dt = time - s.lastTime;
      s.lastTime = time;
      const width = canvas.width;
      const height = canvas.height;

      // Spawn
      s.spawnTimer -= dt;
      if (s.spawnTimer <= 0 && s.fruits.length < 5) {
        const word = WORDS[Math.floor(Math.random() * WORDS.length)];
        const r = 42;
        const x = Math.random() * (width - r * 2) + r;
        s.fruits.push({
          text: word.h,
          pinyin: word.p,
          radius: r,
          x,
          y: height + r,
          vx: (width / 2 - x) * (0.4 + Math.random() * 0.4) / 100,
          vy: -(8.5 + Math.random() * 3.5),
          gravity: 0.14,
          rotation: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.08,
          color: Math.floor(Math.random() * 360)
        });
        s.spawnTimer = 900 + Math.random() * 500;
      }

      // Update fruits
      for (let i = s.fruits.length - 1; i >= 0; i--) {
        const f = s.fruits[i];
        f.x += f.vx;
        f.y += f.vy;
        f.vy += f.gravity;
        f.rotation += f.vr;
        if (f.y > height + f.radius && f.vy > 0) {
          s.fruits.splice(i, 1);
          s.lives--;
          setLives(s.lives);
          playSfx('miss');
          if (s.lives <= 0) {
            s.running = false;
            setIsGameOver(true);
          }
        }
      }

      // Update halves
      for (let i = s.halves.length - 1; i >= 0; i--) {
        const h = s.halves[i];
        h.x += h.vx;
        h.y += h.vy;
        h.vy += h.gravity;
        h.rotation += h.vr;
        h.life -= 0.02;
        if (h.life <= 0) s.halves.splice(i, 1);
      }

      // Update particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.life -= 0.035;
        if (p.life <= 0) s.particles.splice(i, 1);
      }

      // Update trail
      for (let i = s.trail.length - 1; i >= 0; i--) {
        s.trail[i].life -= dt * 0.003;
        if (s.trail[i].life <= 0) s.trail.splice(i, 1);
      }

      // Reset combo
      if (s.combo > 0 && performance.now() - s.lastSliceTime > 800) {
        s.combo = 0;
        setCombo(0);
      }

      // DRAW
      ctx.clearRect(0, 0, width, height);

      // Draw blade trail
      if (s.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(s.trail[0].x, s.trail[0].y);
        for (let i = 1; i < s.trail.length; i++) {
          ctx.lineTo(s.trail[i].x, s.trail[i].y);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Draw fruits
      s.fruits.forEach(f => {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rotation);

        ctx.beginPath();
        ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${f.color}, 80%, 65%, 0.25)`;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = `hsla(${f.color}, 90%, 75%, 1)`;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(f.text, 0, -4);

        ctx.fillStyle = `hsla(${f.color}, 90%, 85%, 1)`;
        ctx.font = 'bold 12px monospace';
        ctx.fillText(f.pinyin, 0, 18);
        ctx.restore();
      });

      // Draw halves
      s.halves.forEach(h => {
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.rotation);
        ctx.globalAlpha = Math.max(0, h.life);
        ctx.beginPath();
        if (h.side === 1) {
          ctx.arc(0, 0, 42, Math.PI / 2, Math.PI * 1.5);
        } else {
          ctx.arc(0, 0, 42, Math.PI * 1.5, Math.PI / 2);
        }
        ctx.fillStyle = `hsla(${h.color}, 80%, 65%, 0.4)`;
        ctx.fill();
        ctx.strokeStyle = `hsla(${h.color}, 90%, 75%, 1)`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      });

      // Draw juice particles
      s.particles.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.color}, 95%, 70%, 1)`;
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [playSfx]);

  // Pointer slice check
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const handlePointerSlice = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = gameStateRef.current;
    if (!s.running || isPausedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (lastPointerRef.current) {
      const p1 = lastPointerRef.current;
      const p2 = { x, y };
      s.trail.push({ x, y, life: 1.0 });
      if (s.trail.length > 18) s.trail.shift();

      // Check hit with fruits
      for (let j = s.fruits.length - 1; j >= 0; j--) {
        const f = s.fruits[j];
        const dist = Math.hypot(p2.x - f.x, p2.y - f.y);
        if (dist < f.radius + 15) {
          // Slice!
          playSfx('slash');
          speakText(f.text);
          const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

          s.halves.push(
            { x: f.x, y: f.y, color: f.color, text: f.text, side: 1, angle, vx: -3, vy: -2, gravity: 0.2, rotation: 0, vr: -0.1, life: 1.0 },
            { x: f.x, y: f.y, color: f.color, text: f.text, side: 2, angle, vx: 3, vy: -2, gravity: 0.2, rotation: 0, vr: 0.1, life: 1.0 }
          );
          for (let k = 0; k < 12; k++) {
            s.particles.push({
              x: f.x,
              y: f.y,
              vx: (Math.random() - 0.5) * 12,
              vy: (Math.random() - 0.5) * 12 - 2,
              color: f.color,
              life: 1.0,
              gravity: 0.25,
              size: Math.random() * 3 + 2
            });
          }

          s.fruits.splice(j, 1);
          s.combo++;
          s.lastSliceTime = performance.now();
          setCombo(s.combo);

          const pts = s.combo > 1 ? 10 * s.combo : 10;
          s.score += pts;
          setScore(s.score);
        }
      }
    }
    lastPointerRef.current = { x, y };
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-[#0e1626] shadow-xl border-4 border-[#1e2a42]">
      {/* HUD */}
      <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent pointer-events-none text-white font-bold text-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-yellow-300">
            ⭐ Điểm: <b className="text-lg text-white">{score}</b>
          </span>
          <span className="flex items-center gap-1.5 text-red-400">
            ❤️ Mạng: <b className="text-lg text-white">{lives}</b>
          </span>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          {combo > 1 && (
            <span className="px-2.5 py-1 rounded-full bg-yellow-400 text-black font-black text-xs animate-bounce shadow-md">
              COMBO x{combo}!
            </span>
          )}
          <button
            onClick={togglePause}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition shadow-sm pointer-events-auto"
            title={isPaused ? 'Tiếp tục' : 'Tạm dừng'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={720}
        height={420}
        onPointerDown={(e) => {
          lastPointerRef.current = null;
          handlePointerSlice(e);
        }}
        onPointerMove={handlePointerSlice}
        onPointerUp={() => { lastPointerRef.current = null; }}
        className="w-full h-[420px] block cursor-crosshair touch-none"
      />

      {/* Paused Modal */}
      {isPaused && !isGameOver && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center z-20 text-white p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-400/20 flex items-center justify-center mb-3 border border-yellow-300/40">
            <Pause className="w-8 h-8 text-yellow-300 fill-current" />
          </div>
          <h3 className="text-2xl font-black text-yellow-300 mb-2">Đang tạm dừng</h3>
          <p className="text-sm text-gray-300 mb-6 max-w-xs">
            Trò chơi đang dừng. Sẵn sàng tiếp tục chém từ vựng Hán ngữ chưa?
          </p>
          <div className="flex gap-3">
            <button
              onClick={togglePause}
              className="px-6 py-2.5 rounded-full font-bold bg-[#a98bff] hover:bg-[#9775fa] text-white text-sm shadow-lg hover:scale-105 active:scale-95 transition flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" /> Tiếp tục chơi
            </button>
            <button
              onClick={() => {
                isPausedRef.current = false;
                resetGame();
              }}
              className="px-6 py-2.5 rounded-full font-bold bg-white/20 hover:bg-white/30 text-white text-sm transition"
            >
              Chơi lại từ đầu
            </button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 text-white p-6 text-center">
          <h3 className="text-3xl font-black text-red-400 mb-2">Trò chơi kết thúc!</h3>
          <p className="text-base text-gray-300 mb-6">
            Tổng điểm của bạn: <b className="text-yellow-300 text-2xl font-black">{score}</b>
          </p>
          <button
            onClick={resetGame}
            className="px-8 py-3 rounded-full font-bold bg-gradient-to-r from-[#ff9dbb] to-[#a98bff] text-white text-sm shadow-lg hover:scale-105 active:scale-95 transition"
          >
            Chơi lại ngay ⚔️
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   8. MINI GAME 2: MEMORY GAME
   ========================================================= */
interface MemoryProps {
  speakText: (t: string) => void;
  playSfx: (type: 'slash' | 'miss' | 'win' | 'correct') => void;
}

function MemoryGame({ speakText, playSfx }: MemoryProps) {
  interface Card {
    uid: number;
    word: string;
    text: string;
    type: 'hanzi' | 'pinyin';
  }

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedUids, setFlippedUids] = useState<number[]>([]);
  const [matchedWords, setMatchedWords] = useState<string[]>([]);

  const startMemory = useCallback(() => {
    const selected = shuffleArray(WORDS).slice(0, 6);
    const deck: Card[] = [];
    selected.forEach((w, i) => {
      deck.push({ uid: i * 2, word: w.h, text: w.h, type: 'hanzi' });
      deck.push({ uid: i * 2 + 1, word: w.h, text: w.p, type: 'pinyin' });
    });
    setCards(shuffleArray(deck));
    setFlippedUids([]);
    setMatchedWords([]);
  }, []);

  useEffect(() => {
    startMemory();
  }, [startMemory]);

  const handleCardClick = (card: Card) => {
    if (flippedUids.length >= 2 || flippedUids.includes(card.uid) || matchedWords.includes(card.word)) {
      return;
    }
    const next = [...flippedUids, card.uid];
    setFlippedUids(next);

    if (card.type === 'hanzi') {
      speakText(card.text);
    }

    if (next.length === 2) {
      const c1 = cards.find(c => c.uid === next[0]);
      const c2 = cards.find(c => c.uid === next[1]);

      if (c1 && c2 && c1.word === c2.word) {
        // Matched!
        playSfx('correct');
        setMatchedWords(prev => {
          const updated = [...prev, c1.word];
          if (updated.length === 6) {
            playSfx('win');
          }
          return updated;
        });
        setFlippedUids([]);
      } else {
        // Not matched
        setTimeout(() => {
          setFlippedUids([]);
        }, 900);
      }
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-md shadow-md border border-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#f0e6f7]">
        <div className="text-sm font-bold text-[#5d4d70]">
          Ghép cặp Chữ Hán với Phiên âm Pinyin tương ứng ({matchedWords.length}/6)
        </div>
        <button
          onClick={startMemory}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#f3edff] text-[#8a6bff] hover:bg-[#e6dcff] transition"
        >
          Trộn bài mới
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {cards.map(card => {
          const isFlipped = flippedUids.includes(card.uid) || matchedWords.includes(card.word);
          const isMatched = matchedWords.includes(card.word);

          return (
            <div
              key={card.uid}
              onClick={() => handleCardClick(card)}
              className={`h-24 sm:h-28 rounded-2xl cursor-pointer [perspective:800px] transition ${
                isMatched ? 'opacity-40 pointer-events-none' : 'hover:scale-105 active:scale-95'
              }`}
            >
              <div
                className={`w-full h-full duration-300 [transform-style:preserve-3d] transition-transform rounded-2xl relative ${
                  isFlipped ? '[transform:rotateY(180deg)]' : ''
                }`}
              >
                {/* Card Back (question mark) */}
                <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl bg-gradient-to-br from-[#a98bff] to-[#8a6bff] text-white flex items-center justify-center font-black text-2xl shadow-sm">
                  ?
                </div>

                {/* Card Front */}
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl bg-white border-2 border-[#a98bff] flex flex-col items-center justify-center p-2 text-center shadow-sm">
                  <span className={`font-bold ${card.type === 'hanzi' ? 'text-2xl text-[#ff7fa3] font-serif' : 'text-sm text-[#8a6bff] font-mono'}`}>
                    {card.text}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {matchedWords.length === 6 && (
        <div className="text-center p-4 rounded-2xl bg-[#eafaf4] text-[#2e8b6f] font-bold text-sm space-y-2">
          <div>🎉 Chúc mừng! Bạn đã ghép thành công tất cả 6 cặp từ!</div>
          <button
            onClick={startMemory}
            className="px-5 py-2 rounded-xl bg-[#4fc3a1] text-white text-xs font-bold hover:brightness-105 shadow-sm"
          >
            Chơi ván tiếp theo
          </button>
        </div>
      )}
    </div>
  );
}
