import requests
import json

API_BASE = "https://secondhand-shop-prod.vercel.app/api"

# 创建5个店铺
shops = [
    {"username": "digital_store", "password": "123456", "shopName": "数码科技店"},
    {"username": "fashion_hub", "password": "123456", "shopName": "时尚潮流馆"},
    {"username": "home_life", "password": "123456", "shopName": "品质家居生活"},
    {"username": "book_garden", "password": "123456", "shopName": "书香花园"},
    {"username": "sport_center", "password": "123456", "shopName": "运动户外专营店"},
]

# 50个产品数据，每个有3张图
products = [
    # 数码产品 (10个)
    {
        "shop": 0, "name": "MacBook Pro 14寸 M3芯片", "price": 12500, "condition": "99新", "category": "电子产品",
        "desc": "2024年1月官网购买，M3芯片，16GB内存+512GB固态。电池循环仅15次，健康度100%。带原包装盒、充电器、数据线。屏幕贴有钢化膜，机身无划痕。",
        "images": [
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=400",
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
            "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400"
        ]
    },
    {
        "shop": 0, "name": "iPad Air 5 256GB", "price": 4200, "condition": "95新", "category": "电子产品",
        "desc": "M1芯片，紫色。2023年购买，使用爱惜，屏幕贴膜、带保护壳。配件齐全，送第三方键盘和保护套。适合学习和办公。",
        "images": [
            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
            "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=400",
            "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400"
        ]
    },
    {
        "shop": 0, "name": "Sony WH-1000XM5 降噪耳机", "price": 1800, "condition": "95新", "category": "电子产品",
        "desc": "2023年底购买，使用次数很少。降噪效果顶级，音质出色。外观无明显划痕，耳罩干净。原盒、收纳盒、充电线齐全。",
        "images": [
            "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400",
            "https://images.unsplash.com/photo-1585298723682-7115561c51b7?w=400",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400"
        ]
    },
    {
        "shop": 0, "name": "Canon EOS R6 全画幅微单", "price": 15800, "condition": "9成新", "category": "电子产品",
        "desc": "快门次数约12000次，外观轻微使用痕迹，功能完美。带RF 24-105mm F4镜头。配件：3块电池、充电器、肩带、相机包。",
        "images": [
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
            "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400",
            "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400"
        ]
    },
    {
        "shop": 0, "name": "Dell XPS 13 笔记本", "price": 6800, "condition": "95新", "category": "电子产品",
        "desc": "i7-1165G7处理器，16GB内存，512GB固态。4K触控屏，外观精致。2023年购买，因换Mac出。带原装电源和包装盒。",
        "images": [
            "https://images.unsplash.com/photo-1593642632823-8f78536788c0?w=400",
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
            "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400"
        ]
    },
    {
        "shop": 0, "name": "Apple Watch Ultra 2", "price": 5200, "condition": "99新", "category": "电子产品",
        "desc": "2024年购买，仅佩戴2周。电池健康100%，表身无划痕。原包装盒、表带、充电器齐全。送2条第三方表带。",
        "images": [
            "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400",
            "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400",
            "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400"
        ]
    },
    {
        "shop": 0, "name": "DJI Mini 4 Pro 无人机", "price": 4800, "condition": "95新", "category": "电子产品",
        "desc": "带屏遥控器版，仅飞行5次。4K60fps拍摄，避障功能完善。配件：3块电池、充电管家、收纳包、ND滤镜。",
        "images": [
            "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400",
            "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=400",
            "https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=400"
        ]
    },
    {
        "shop": 0, "name": "Bose SoundLink Flex 音箱", "price": 850, "condition": "9成新", "category": "电子产品",
        "desc": "便携蓝牙音箱，音质出色，防水设计。户外使用完美，续航约12小时。外观轻微使用痕迹，功能正常。",
        "images": [
            "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
            "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400"
        ]
    },
    {
        "shop": 0, "name": "Nintendo Switch Lite 蓝色", "price": 980, "condition": "95新", "category": "电子产品",
        "desc": "2023年购买，使用较少。屏幕贴膜，机身无划痕。带原装充电器和收纳包。无漂移，按键灵敏。",
        "images": [
            "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400",
            "https://images.unsplash.com/photo-1592107761705-30a1bbc641e7?w=400",
            "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=400"
        ]
    },
    {
        "shop": 0, "name": "Kindle Oasis 3 32GB", "price": 1500, "condition": "95新", "category": "电子产品",
        "desc": "7英寸墨水屏，冷暖光调节。阅读体验极佳，32GB大容量。外观几乎全新，带皮套。",
        "images": [
            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
            "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=400"
        ]
    },
    # 服饰产品 (10个)
    {
        "shop": 1, "name": "LV Neverfull 中号", "price": 8800, "condition": "9成新", "category": "服饰",
        "desc": "经典老花，2022年专柜购入。有发票，支持验货。轻微使用痕迹，无划痕破损。容量大，通勤妈咪包首选。",
        "images": [
            "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400",
            "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400",
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400"
        ]
    },
    {
        "shop": 1, "name": "Yeezy 350 V2 白斑马", "price": 1600, "condition": "全新", "category": "服饰",
        "desc": "42码，adidas Confirmed中签。原盒未拆，鞋带未穿。已过毒鉴定，保证正品。经典配色，收藏价值高。",
        "images": [
            "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400",
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400"
        ]
    },
    {
        "shop": 1, "name": "北面1996羽绒服", "price": 1500, "condition": "95新", "category": "服饰",
        "desc": "经典黑色，M码。2023年购买，保暖性能一流。700蓬鹅绒填充，无跑绒。洗涤过1次，蓬松度依然很好。",
        "images": [
            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400",
            "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400",
            "https://images.unsplash.com/photo-1551028919-ac76c9028d1b?w=400"
        ]
    },
    {
        "shop": 1, "name": "Gucci 经典腰带", "price": 2200, "condition": "95新", "category": "服饰",
        "desc": "双G扣，4cm宽，90码。2022年购入，带包装盒和防尘袋。皮质无划痕，扣件光泽如新。",
        "images": [
            "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400",
            "https://images.unsplash.com/photo-1559563458-527698bf5295?w=400",
            "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400"
        ]
    },
    {
        "shop": 1, "name": "ZARA长款风衣", "price": 380, "condition": "9成新", "category": "服饰",
        "desc": "卡其色，L码。版型很好，适合春秋。仅穿过几次，几乎全新。腰部可收，显身材。",
        "images": [
            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400",
            "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400",
            "https://images.unsplash.com/photo-1550614000-4b9519e02a48?w=400"
        ]
    },
    {
        "shop": 1, "name": "Prada 墨镜", "price": 1800, "condition": "95新", "category": "服饰",
        "desc": "经典款，黑色镜框。2023年购买，镜片无划痕，镜腿松紧正常。带原装眼镜盒和布。",
        "images": [
            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400",
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
            "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=400"
        ]
    },
    {
        "shop": 1, "name": "Nike运动套装", "price": 450, "condition": "全新", "category": "服饰",
        "desc": "上衣+裤子一套，M码。未拆吊牌，官网购入。适合健身跑步，透气舒适。",
        "images": [
            "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400",
            "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400",
            "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400"
        ]
    },
    {
        "shop": 1, "name": "Coach托特包", "price": 1200, "condition": "95新", "category": "服饰",
        "desc": "经典老花款，容量大，通勤上学都适合。2023年购买，皮质无划痕，五金件光亮。",
        "images": [
            "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400",
            "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400",
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400"
        ]
    },
    {
        "shop": 1, "name": "Timberland大黄靴", "price": 680, "condition": "9成新", "category": "服饰",
        "desc": "43码，防水耐磨。户外徒步首选，鞋底纹路清晰。已清洁保养好，到手即穿。",
        "images": [
            "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400",
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400"
        ]
    },
    {
        "shop": 1, "name": "始祖鸟冲锋衣", "price": 2800, "condition": "95新", "category": "服饰",
        "desc": "Alpha SV系列，顶级冲锋衣。Gore-Tex面料，防水透气。仅登山穿过2次，几乎全新。",
        "images": [
            "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400",
            "https://images.unsplash.com/photo-1551028919-ac76c9028d1b?w=400",
            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400"
        ]
    },
    # 家具产品 (10个)
    {
        "shop": 2, "name": "宜家Pax衣柜", "price": 1500, "condition": "9成新", "category": "家具",
        "desc": "2米宽白色衣柜，含内部配件。使用1年，无划痕。已拆卸，方便搬运，附说明书。",
        "images": [
            "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400",
            "https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=400",
            "https://images.unsplash.com/photo-1560184897-67f4a3f9a7fa?w=400"
        ]
    },
    {
        "shop": 2, "name": "小米空气净化器Pro", "price": 600, "condition": "95新", "category": "家具",
        "desc": "适用60平米，OLED显示屏。滤芯剩余80%，净化效果好。静音设计，可连米家APP。",
        "images": [
            "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400",
            "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400",
            "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400"
        ]
    },
    {
        "shop": 2, "name": "实木餐桌椅套装", "price": 2200, "condition": "95新", "category": "家具",
        "desc": "橡木餐桌1.4米+4把椅子。北欧简约风，质感很好。使用半年，无明显磨损。",
        "images": [
            "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400",
            "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
            "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=400"
        ]
    },
    {
        "shop": 2, "name": "戴森AM09暖风扇", "price": 1800, "condition": "95新", "category": "家具",
        "desc": "冷暖两用，四季可用。无叶设计安全，风力强劲。原包装盒和遥控器都在。",
        "images": [
            "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400",
            "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400",
            "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400"
        ]
    },
    {
        "shop": 2, "name": "真皮沙发", "price": 3500, "condition": "9成新", "category": "家具",
        "desc": "头层牛皮，三人位。2022年购入，真皮无破损，坐感舒适。因装修换风格出。",
        "images": [
            "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
            "https://images.unsplash.com/photo-1550226891-ef816aed4a98?w=400",
            "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400"
        ]
    },
    {
        "shop": 2, "name": "Tempur记忆枕", "price": 480, "condition": "全新", "category": "家具",
        "desc": "经典款，未拆封。原装进口，支撑性好，适合颈椎不适人群。",
        "images": [
            "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400",
            "https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=400",
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400"
        ]
    },
    {
        "shop": 2, "name": "美的烤箱35L", "price": 280, "condition": "9成新", "category": "家具",
        "desc": "容量大，烤全鸡没问题。上下独立控温，功能正常。仅用过几次做烘焙。",
        "images": [
            "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400",
            "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400",
            "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400"
        ]
    },
    {
        "shop": 2, "name": "扫地机器人", "price": 1200, "condition": "95新", "category": "家具",
        "desc": "石头T7，激光导航，扫拖一体。避障智能，可APP远程控制。使用一年，滤网刚换。",
        "images": [
            "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=400",
            "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400",
            "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400"
        ]
    },
    {
        "shop": 2, "name": "宜家书架", "price": 350, "condition": "95新", "category": "家具",
        "desc": "Kallax系列，4格设计。白色，可做书架或收纳。已组装好，也可拆卸。",
        "images": [
            "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400",
            "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400",
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400"
        ]
    },
    {
        "shop": 2, "name": "飞利浦护眼台灯", "price": 380, "condition": "99新", "category": "家具",
        "desc": "国AA级护眼，色温可调。适合学习办公，无频闪。使用2个月，几乎全新。",
        "images": [
            "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
            "https://images.unsplash.com/photo-1513506003013-d5347e0f95d1?w=400",
            "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400"
        ]
    },
    # 书籍产品 (10个)
    {
        "shop": 3, "name": "哈利波特全集精装", "price": 380, "condition": "99新", "category": "书籍",
        "desc": "人民文学出版社，7册精装礼盒装。仅拆封翻阅，书脊完美。适合收藏或送礼。",
        "images": [
            "https://images.unsplash.com/photo-1618666012174-83b441c0bc76?w=400",
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400"
        ]
    },
    {
        "shop": 3, "name": "日本推理小说套装", "price": 280, "condition": "95新", "category": "书籍",
        "desc": "东野圭吾作品集5本：《白夜行》《嫌疑人X的献身》等。阅读痕迹轻微。",
        "images": [
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
            "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400"
        ]
    },
    {
        "shop": 3, "name": "全彩DK百科全书", "price": 450, "condition": "95新", "category": "书籍",
        "desc": "厚重精装，全彩印刷，适合青少年科普。仅翻阅几次，品相很好。",
        "images": [
            "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400",
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400"
        ]
    },
    {
        "shop": 3, "name": "金庸全集", "price": 680, "condition": "9成新", "category": "书籍",
        "desc": "朗声旧版，36册全集。经典收藏版，书页微黄但保存完好。武侠迷必备。",
        "images": [
            "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400",
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"
        ]
    },
    {
        "shop": 3, "name": "设计心理学", "price": 68, "condition": "95新", "category": "书籍",
        "desc": "唐纳德·诺曼著，设计经典读物。内页无笔记，书脊完好。",
        "images": [
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
            "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400"
        ]
    },
    {
        "shop": 3, "name": "故宫日历2024", "price": 88, "condition": "全新", "category": "书籍",
        "desc": "塑封未拆，适合收藏或送礼。每日一文物，精美印刷。",
        "images": [
            "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400",
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400"
        ]
    },
    {
        "shop": 3, "name": "小王子立体书", "price": 180, "condition": "99新", "category": "书籍",
        "desc": "精美立体设计，翻开惊艳。适合送给小朋友或收藏。",
        "images": [
            "https://images.unsplash.com/photo-1633477189729-9290b3261d0a?w=400",
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400"
        ]
    },
    {
        "shop": 3, "name": "深度学习", "price": 120, "condition": "95新", "category": "书籍",
        "desc": "AI圣经，花书。内页少量笔记，不影响阅读。",
        "images": [
            "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400"
        ]
    },
    {
        "shop": 3, "name": "百年孤独", "price": 45, "condition": "全新", "category": "书籍",
        "desc": "马尔克斯经典，未拆封。魔幻现实主义巅峰之作。",
        "images": [
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
            "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400"
        ]
    },
    {
        "shop": 3, "name": "全套漫威漫画", "price": 880, "condition": "95新", "category": "书籍",
        "desc": "合集共20册，经典故事完整收录。漫威迷必收。",
        "images": [
            "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400",
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400"
        ]
    },
    # 其他产品 (10个)
    {
        "shop": 4, "name": "捷安特公路车", "price": 3200, "condition": "95新", "category": "其他",
        "desc": "TCR Advanced 2，碳纤维前叉。骑行约800公里，保养良好。送头盔、车锁。",
        "images": [
            "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400",
            "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400",
            "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400"
        ]
    },
    {
        "shop": 4, "name": "瑜伽垫套装", "price": 180, "condition": "全新", "category": "其他",
        "desc": "TPE材质，防滑加厚。含瑜伽砖2块、伸展带。未拆封。",
        "images": [
            "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400",
            "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
            "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400"
        ]
    },
    {
        "shop": 4, "name": "斯诺克球杆", "price": 1500, "condition": "95新", "category": "其他",
        "desc": "LP尊者，小头杆。通杆设计，白蜡木前肢。使用半年，杆身直。",
        "images": [
            "https://images.unsplash.com/photo-1616088434960-c09e5e4e72ba?w=400",
            "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=400",
            "https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=400"
        ]
    },
    {
        "shop": 4, "name": "露营帐篷", "price": 650, "condition": "9成新", "category": "其他",
        "desc": "3-4人全自动帐篷，防雨防晒。使用过2次，配件齐全。送防潮垫。",
        "images": [
            "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400",
            "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=400",
            "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400"
        ]
    },
    {
        "shop": 4, "name": "星特朗天文望远镜", "price": 2800, "condition": "95新", "category": "其他",
        "desc": "80EQ，观星入门首选。带赤道仪，可追踪天体。配件齐全，送月亮滤镜。",
        "images": [
            "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=400",
            "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400",
            "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400"
        ]
    },
    {
        "shop": 4, "name": "乐高保时捷911", "price": 1800, "condition": "全新", "category": "其他",
        "desc": "Technic系列，1580颗粒。原盒未拆，适合拼装收藏。",
        "images": [
            "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=400",
            "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=400",
            "https://images.unsplash.com/photo-1593369297372-150d638273c6?w=400"
        ]
    },
    {
        "shop": 4, "name": "瑞士军刀", "price": 280, "condition": "全新", "category": "其他",
        "desc": " Huntsman系列，15功能。正品，未使用。户外必备工具。",
        "images": [
            "https://images.unsplash.com/photo-1587583639007-f309f52b2b4f?w=400",
            "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400",
            "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=400"
        ]
    },
    {
        "shop": 4, "name": "钓鱼竿套装", "price": 450, "condition": "95新", "category": "其他",
        "desc": "碳素手竿4.5米，含渔轮、鱼线、鱼钩套装。使用次数少，配件齐全。",
        "images": [
            "https://images.unsplash.com/photo-1516962126636-27ad087061cc?w=400",
            "https://images.unsplash.com/photo-1560827818-44a4d25e34fc?w=400",
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400"
        ]
    },
    {
        "shop": 4, "name": "电子琴", "price": 800, "condition": "95新", "category": "其他",
        "desc": "雅马哈PSR-E373，61键。功能丰富，适合初学者。送琴架和琴包。",
        "images": [
            "https://images.unsplash.com/photo-1552422535-c45813c61732?w=400",
            "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400",
            "https://images.unsplash.com/photo-1514117445516-2ecfc9c4ec90?w=400"
        ]
    },
    {
        "shop": 4, "name": "油画颜料套装", "price": 320, "condition": "全新", "category": "其他",
        "desc": "温莎牛顿24色，送画笔和调色板。适合油画入门。",
        "images": [
            "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400",
            "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400",
            "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400"
        ]
    },
]

print("开始创建店铺和产品...\n")

# 存储店铺token
shop_tokens = {}

# 1. 创建店铺
for i, shop in enumerate(shops):
    try:
        # 注册
        r = requests.post(f"{API_BASE}/auth/register", json=shop)
        if r.status_code == 201:
            print(f"✅ 店铺 {i+1}: {shop['shopName']} 创建成功")
        else:
            print(f"⚠️ 店铺 {i+1}: {r.json().get('error', '可能已存在')}")
        
        # 登录获取token
        r = requests.post(f"{API_BASE}/auth/login", json={"username": shop["username"], "password": shop["password"]})
        if r.status_code == 200:
            shop_tokens[i] = r.json()["token"]
            print(f"   登录成功，获取到token\n")
    except Exception as e:
        print(f"❌ 店铺 {i+1} 失败: {e}\n")

print("\n开始添加50个产品...\n")

# 2. 添加产品
count = 0
for product in products:
    try:
        shop_idx = product["shop"]
        if shop_idx not in shop_tokens:
            print(f"❌ 跳过产品: 店铺{shop_idx}无token")
            continue
            
        token = shop_tokens[shop_idx]
        
        # 使用第一张图作为主图
        main_image = product["images"][0]
        
        data = {
            "name": product["name"],
            "price": product["price"],
            "condition": product["condition"],
            "category": product["category"],
            "categoryValue": product["category"].lower(),
            "desc": product["desc"] + "\n\n【图片展示】\n" + "\n".join([f"图片{i+1}: {url}" for i, url in enumerate(product["images"])]),
            "image": main_image
        }
        
        r = requests.post(
            f"{API_BASE}/items",
            json=data,
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        )
        
        if r.status_code == 201:
            count += 1
            print(f"✅ [{count}/50] {product['name']}")
        else:
            print(f"❌ {product['name']}: {r.status_code}")
            
    except Exception as e:
        print(f"❌ {product['name']}: {e}")

print(f"\n{'='*60}")
print(f"完成！成功添加 {count} 个产品到 {len(shop_tokens)} 个店铺")
print(f"{'='*60}")
