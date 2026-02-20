const API_BASE = '/api';

// 当前登录用户
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// 页面状态
let currentView = 'home'; // home, shop, myshop, login, register

// 初始化
async function init() {
    if (authToken) {
        await loadCurrentUser();
    }
    renderHeader();
    showHome(); // 先渲染首页，再加载商品
}

// 加载当前用户
async function loadCurrentUser() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (response.ok) {
            currentUser = await response.json();
        } else {
            authToken = null;
            localStorage.removeItem('authToken');
        }
    } catch (e) {
        console.error('加载用户信息失败');
    }
}

// 渲染头部导航
function renderHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    
    header.innerHTML = `
        <div class="header-left">
            <h1 onclick="showHome()">🏪 东区集市</h1>
        </div>
        <div class="header-right">
            <button onclick="showShops()" class="nav-btn">🏪 逛店铺</button>
            ${currentUser ? `
                <button onclick="showMyShop()" class="nav-btn">🏠 我的店铺</button>
                <span class="user-name">${currentUser.shopName}</span>
                <button onclick="logout()" class="nav-btn logout">退出</button>
            ` : `
                <button onclick="showLogin()" class="nav-btn">登录</button>
                <button onclick="showRegister()" class="nav-btn primary">开店</button>
            `}
        </div>
    `;
}

// 显示首页
function showHome() {
    currentView = 'home';
    document.getElementById('mainContent').innerHTML = `
        <div class="welcome-banner">
            <h2>🏪 欢迎来到东区集市</h2>
            <p>每个人都可以开店卖货</p>
            <div class="hero-buttons">
                <button onclick="showRegister()" class="cta-button">
                    🚀 免费注册开店
                </button>
                <button onclick="showLiveCamera()" class="cta-button secondary">
                    📹 视频看货
                </button>
            </div>
        </div>
        <div class="stats-bar">
            <div class="stat-item">
                <span class="stat-number">50+</span>
                <span class="stat-label">精选商品</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">5</span>
                <span class="stat-label">优质店铺</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">0</span>
                <span class="stat-label">开店费用</span>
            </div>
        </div>
        <div class="section-title">🔥 热门商品</div>
        <div class="grid" id="itemGrid">加载中...</div>
        <div class="cta-section">
            <h3>有闲置物品要卖？</h3>
            <p>现在注册，立即拥有属于自己的店铺</p>
            <button onclick="showRegister()" class="btn-primary large">
                🏪 免费开店
            </button>
        </div>
    `;
    // 延迟加载商品，确保DOM已渲染
    setTimeout(loadItems, 100);
}

// 显示所有店铺
async function showShops() {
    currentView = 'shops';
    document.getElementById('mainContent').innerHTML = `
        <div class="section-title">🏪 所有店铺</div>
        <div class="shop-list" id="shopList">加载中...</div>
    `;
    
    try {
        const response = await fetch(`${API_BASE}/shops`);
        const shops = await response.json();
        
        const container = document.getElementById('shopList');
        if (shops.length === 0) {
            container.innerHTML = '<div class="empty">暂无店铺</div>';
            return;
        }
        
        container.innerHTML = shops.map(shop => `
            <div class="shop-card" onclick="showShopDetail('${shop._id}')">
                <div class="shop-icon">🏪</div>
                <div class="shop-info">
                    <div class="shop-name">${shop.shopName}</div>
                    <div class="shop-owner">店主: ${shop.username}</div>
                    <div class="shop-stats">在售商品: ${shop.itemCount}件</div>
                </div>
                <div class="shop-arrow">→</div>
            </div>
        `).join('');
    } catch (e) {
        document.getElementById('shopList').innerHTML = '<div class="error">加载失败</div>';
    }
}

// 显示指定店铺
async function showShopDetail(userId) {
  currentView = 'shopDetail';
  document.getElementById('mainContent').innerHTML = `<div class="grid" id="itemGrid">加载中...</div>`;

  try {
    const response = await fetch(`${API_BASE}/shop/items?userId=${userId}`);
    const data = await response.json();

    const announcementHtml = data.shop.announcement
      ? `<div class="announcement-bar">
           <div class="announcement-content">
             <span class="announcement-icon">📢</span>${data.shop.announcement}
           </div>
         </div>`
      : '';

    document.getElementById('mainContent').innerHTML = `
            <div class="shop-header">
                <button onclick="showShops()" class="back-btn">← 返回</button>
                <div class="shop-title">
                    <div class="shop-icon large">🏪</div>
                    <div>
                        <h2>${data.shop.shopName}</h2>
                        <p>店主: ${data.shop.username}</p>
                    </div>
                </div>
            </div>
            ${announcementHtml}
            <div class="section-title">📦 店铺商品 (${data.items.length})</div>
            <div class="grid" id="itemGrid"></div>
        `;

    renderItems(data.items, 'itemGrid', false);
  } catch (e) {
    document.getElementById('mainContent').innerHTML = '<div class="error">加载失败</div>';
  }
}
        
        renderItems(data.items, 'itemGrid', false);
    } catch (e) {
        document.getElementById('mainContent').innerHTML = '<div class="error">加载失败</div>';
    }
}

// 显示登录页
function showLogin() {
    currentView = 'login';
    document.getElementById('mainContent').innerHTML = `
        <div class="auth-form">
            <h2>🔐 登录</h2>
            <div class="form-group">
                <label>用户名</label>
                <input type="text" id="loginUsername" placeholder="输入用户名">
            </div>
            <div class="form-group">
                <label>密码</label>
                <input type="password" id="loginPassword" placeholder="输入密码">
            </div>
            <button onclick="doLogin()" class="btn-primary">登录</button>
            <p class="form-link">还没有账号？<a onclick="showRegister()">立即开店</a></p>
        </div>
    `;
}

// 显示注册页
function showRegister() {
    currentView = 'register';
    document.getElementById('mainContent').innerHTML = `
        <div class="auth-form">
            <h2>🏪 开店注册</h2>
            <div class="form-group">
                <label>用户名</label>
                <input type="text" id="regUsername" placeholder="设置用户名">
            </div>
            <div class="form-group">
                <label>密码</label>
                <input type="password" id="regPassword" placeholder="设置密码">
            </div>
            <div class="form-group">
                <label>店铺名称</label>
                <input type="text" id="regShopName" placeholder="给你的店铺起个名字">
            </div>
            <button onclick="doRegister()" class="btn-primary">创建店铺</button>
            <p class="form-link">已有账号？<a onclick="showLogin()">直接登录</a></p>
        </div>
    `;
}

// 登录操作
async function doLogin() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        alert('请填写用户名和密码');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            renderHeader();
            showMyShop();
        } else {
            alert(data.error || '登录失败');
        }
    } catch (e) {
        alert('网络错误');
    }
}

// 注册操作
async function doRegister() {
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const shopName = document.getElementById('regShopName').value;
    
    if (!username || !password) {
        alert('请填写用户名和密码');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, shopName })
        });
        
        const data = await response.json();
        if (response.ok) {
            alert('注册成功！请登录');
            showLogin();
        } else {
            alert(data.error || '注册失败');
        }
    } catch (e) {
        alert('网络错误');
    }
}

// 退出登录
function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    renderHeader();
    showHome();
}

// 显示我的店铺
async function showMyShop() {
  if (!currentUser) {
    showLogin();
    return;
  }

  currentView = 'myshop';
  document.getElementById('mainContent').innerHTML = `
        <div class="my-shop-header">
            <div class="shop-info-card">
                <div class="shop-icon large">🏪</div>
                <div>
                    <h2>${currentUser.shopName}</h2>
                    <p>我的店铺</p>
                </div>
            </div>
            <button onclick="showAddItem()" class="btn-primary large">+ 发布商品</button>
        </div>
        <div class="announcement-edit">
            <h3>📢 店铺公告</h3>
            <input type="text" id="announcementInput" class="announcement-input" 
                   placeholder="设置店铺公告（例如：本店所有商品包邮、限时优惠等）" 
                   value="${currentUser.announcement || ''}" maxlength="100">
            <div class="announcement-actions">
                <button onclick="saveAnnouncement()" class="btn-save">💾 保存公告</button>
                <button onclick="clearAnnouncement()" class="btn-clear">🗑️ 清空</button>
            </div>
            <div class="announcement-preview" id="announcementPreview" style="display: ${currentUser.announcement ? 'block' : 'none'}">
                <strong>预览效果：</strong> <span id="previewText">${currentUser.announcement || ''}</span>
            </div>
        </div>
        <div class="section-title">📦 我的商品</div>
        <div class="grid" id="myItemGrid">加载中...</div>
    `;

  // 实时预览
  const input = document.getElementById('announcementInput');
  const preview = document.getElementById('announcementPreview');
  const previewText = document.getElementById('previewText');

  input.addEventListener('input', function () {
    const value = this.value.trim();
    if (value) {
      preview.style.display = 'block';
      previewText.textContent = value;
    } else {
      preview.style.display = 'none';
    }
  });

  loadMyItems();
}

// 保存公告
async function saveAnnouncement() {
  const announcement = document.getElementById('announcementInput').value.trim();

  try {
    const response = await fetch(`${API_BASE}/shop/announcement`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ announcement })
    });

    const data = await response.json();
    if (response.ok) {
      currentUser.announcement = announcement;
      alert(announcement ? '公告已保存！' : '公告已清空');
    } else {
      alert(data.error || '保存失败');
    }
  } catch (e) {
    alert('网络错误');
  }
}

// 清空公告
function clearAnnouncement() {
  document.getElementById('announcementInput').value = '';
  document.getElementById('announcementPreview').style.display = 'none';
  saveAnnouncement();
}

// 加载我的商品
async function loadMyItems() {
    try {
        const response = await fetch(`${API_BASE}/shop/items?userId=${currentUser._id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        renderItems(data.items, 'myItemGrid', true);
    } catch (e) {
        document.getElementById('myItemGrid').innerHTML = '<div class="error">加载失败</div>';
    }
}

// 渲染商品列表
function renderItems(items, containerId, isOwner) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (items.length === 0) {
        container.innerHTML = '<div class="empty">暂无商品</div>';
        return;
    }
    
    container.innerHTML = items.map(item => `
        <div class="item-card">
            <img class="item-image" src="${item.image}" alt="" onclick="showItemDetail('${item._id}')">
            ${item.status === 'sold' ? '<div class="item-overlay">已售</div>' : ''}
            <div class="item-info">
                <div class="item-price">$${item.price}</div>
                <div class="item-name">${item.name}</div>
                ${isOwner ? `
                    <div class="item-actions">
                        <button onclick="editItem('${item._id}')" class="btn-small">编辑</button>
                        <button onclick="deleteItem('${item._id}')" class="btn-small danger">删除</button>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// 加载所有商品（首页）
async function loadItems() {
    try {
        const response = await fetch(`${API_BASE}/items`);
        const items = await response.json();
        renderItems(items, 'itemGrid', false);
    } catch (e) {
        document.getElementById('itemGrid').innerHTML = '<div class="error">加载失败</div>';
    }
}

// 显示添加商品页
function showAddItem() {
    if (!currentUser) {
        showLogin();
        return;
    }
    
    currentView = 'addItem';
    document.getElementById('mainContent').innerHTML = `
        <div class="form-page">
            <h2>📷 发布商品</h2>
            <div class="form-group">
                <label>商品图片</label>
                <input type="file" id="itemImage" accept="image/*" capture="camera">
                <div id="imagePreview"></div>
            </div>
            <div class="form-group">
                <label>商品名称 *</label>
                <input type="text" id="itemName" placeholder="输入商品名称">
            </div>
            <div class="form-group">
                <label>价格 *</label>
                <input type="number" id="itemPrice" placeholder="输入价格">
            </div>
            <div class="form-group">
                <label>成色</label>
                <select id="itemCondition">
                    <option>全新未拆封</option>
                    <option>99新</option>
                    <option selected>95新</option>
                    <option>9成新</option>
                    <option>8成新</option>
                </select>
            </div>
            <div class="form-group">
                <label>分类</label>
                <select id="itemCategory">
                    <option value="电子产品">📱 电子产品</option>
                    <option value="家具">🪑 家具</option>
                    <option value="服饰">👕 服饰</option>
                    <option value="书籍">📚 书籍</option>
                    <option value="其他">📦 其他</option>
                </select>
            </div>
            <div class="form-group">
                <label>详细描述</label>
                <textarea id="itemDesc" rows="4" placeholder="描述商品详情、使用情况、配件等..."></textarea>
            </div>
            <button onclick="doAddItem()" class="btn-primary">发布商品</button>
        </div>
    `;
    
    // 图片预览
    document.getElementById('itemImage').addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('imagePreview').innerHTML = 
                    `<img src="${event.target.result}" style="max-width: 200px; margin-top: 10px;">`;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
}

// 添加商品
async function doAddItem() {
    const name = document.getElementById('itemName').value;
    const price = document.getElementById('itemPrice').value;
    const condition = document.getElementById('itemCondition').value;
    const category = document.getElementById('itemCategory').value;
    const desc = document.getElementById('itemDesc').value;
    const imagePreview = document.querySelector('#imagePreview img');
    
    if (!name || !price) {
        alert('请填写商品名称和价格');
        return;
    }
    
    const image = imagePreview ? imagePreview.src : 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400';
    
    try {
        const response = await fetch(`${API_BASE}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ name, price, condition, category, categoryValue: category, desc, image })
        });
        
        if (response.ok) {
            alert('发布成功！');
            showMyShop();
        } else {
            const data = await response.json();
            alert(data.error || '发布失败');
        }
    } catch (e) {
        alert('网络错误');
    }
}

// 删除商品
async function deleteItem(id) {
    if (!confirm('确定删除此商品？')) return;
    
    try {
        const response = await fetch(`${API_BASE}/items?id=${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            loadMyItems();
        } else {
            alert('删除失败');
        }
    } catch (e) {
        alert('网络错误');
    }
}

// 显示商品详情
async function showItemDetail(id) {
    try {
        // 获取商品详情
        const response = await fetch(`${API_BASE}/items`);
        const items = await response.json();
        const item = items.find(i => i._id === id);
        
        if (!item) {
            alert('商品不存在');
            return;
        }
        
        // 获取店铺信息
        const shopResponse = await fetch(`${API_BASE}/shops`);
        const shops = await shopResponse.json();
        const shop = shops.find(s => s._id === item.userId);
        
        currentView = 'itemDetail';
        document.getElementById('mainContent').innerHTML = `
            <div class="item-detail">
                <button onclick="showHome()" class="back-btn">← 返回</button>
                
                <div class="item-detail-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                
                <div class="item-detail-info">
                    <div class="item-detail-price">$${item.price}</div>
                    <h1 class="item-detail-name">${item.name}</h1>
                    
                    <div class="item-detail-meta">
                        <span class="condition-tag">${item.condition}</span>
                        <span class="category-tag">${item.category}</span>
                    </div>
                    
                    ${shop ? `
                    <div class="shop-info-bar" onclick="showShopDetail('${shop._id}')">
                        <div class="shop-icon small">🏪</div>
                        <div class="shop-info-text">
                            <div class="shop-name-small">${shop.shopName}</div>
                            <div class="shop-view">查看店铺 →</div>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="item-detail-section">
                        <h3>商品描述</h3>
                        <div class="item-detail-desc">${item.desc.replace(/\n/g, '<br>')}</div>
                    </div>
                    
                    <div class="item-detail-section">
                        <h3>购买方式</h3>
                        <p class="contact-info">💬 点击下方按钮联系卖家</p>
                    </div>
                    
                    <div class="item-detail-actions">
                        <a href="weixin://" class="btn-contact">
                            💬 微信联系卖家
                        </a>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        console.error('加载商品详情失败:', e);
        alert('加载失败');
    }
}

// 联系卖家
function contactSeller(userId, itemName) {
    alert('联系功能开发中...\n\n商品: ' + itemName);
}

// 编辑商品
function editItem(id) {
    console.log('编辑商品:', id);
}

// ==================== 摄像头实时看货功能 ====================

// 显示视频看货页面
async function showLiveCamera() {
    currentView = 'liveCamera';
    document.getElementById('mainContent').innerHTML = `
        <div class="camera-page">
            <div class="camera-header">
                <button onclick="showHome()" class="back-btn white">← 返回</button>
                <h2>📹 视频看货</h2>
                <p>让我看看你要卖的物品</p>
            </div>
            
            <div class="camera-container">
                <video id="cameraVideo" autoplay playsinline></video>
                <canvas id="cameraCanvas" style="display:none;"></canvas>
                
                <div class="camera-overlay" id="cameraOverlay">
                    <div class="camera-status">正在启动摄像头...</div>
                </div>
            </div>
            
            <div class="camera-controls">
                <button id="startCameraBtn" onclick="startCamera()" class="btn-camera primary">
                    📷 开启摄像头
                </button>
                <button id="captureBtn" onclick="capturePhoto()" class="btn-camera capture" style="display:none;">
                    📸 拍照
                </button>
                <button id="stopCameraBtn" onclick="stopCamera()" class="btn-camera stop" style="display:none;">
                    ⏹ 关闭
                </button>
            </div>
            
            <div class="camera-preview" id="photoPreview" style="display:none;">
                <h3>📷 拍摄预览</h3>
                <img id="previewImage" src="" alt="拍摄的照片">
                <div class="preview-actions">
                    <button onclick="retakePhoto()" class="btn-camera">🔄 重拍</button>
                    <button onclick="sendToAssistant()" class="btn-camera primary">📤 发给大喵助理</button>
                </div>
            </div>
            
            <div class="camera-tips">
                <h4>💡 使用提示</h4>
                <ul>
                    <li>确保光线充足，让物品清晰可见</li>
                    <li>可以多角度拍摄，展示物品细节</li>
                    <li>拍照后点击"发给大喵助理"，我会帮你估价</li>
                </ul>
            </div>
        </div>
    `;
}

let cameraStream = null;
let capturedImageData = null;

// 启动摄像头
async function startCamera() {
    const video = document.getElementById('cameraVideo');
    const overlay = document.getElementById('cameraOverlay');
    const startBtn = document.getElementById('startCameraBtn');
    const captureBtn = document.getElementById('captureBtn');
    const stopBtn = document.getElementById('stopCameraBtn');
    
    try {
        overlay.innerHTML = '<div class="camera-status">🎥 正在请求摄像头权限...</div>';
        
        // 请求摄像头权限 - 优先使用后置摄像头（手机）或默认摄像头（Mac）
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: 'environment',  // 优先后置摄像头
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        });
        
        video.srcObject = cameraStream;
        
        video.onloadedmetadata = () => {
            overlay.style.display = 'none';
            startBtn.style.display = 'none';
            captureBtn.style.display = 'inline-block';
            stopBtn.style.display = 'inline-block';
        };
        
    } catch (err) {
        console.error('摄像头启动失败:', err);
        overlay.innerHTML = `
            <div class="camera-status error">
                ❌ 无法启动摄像头<br>
                <small>${err.message}</small><br>
                <button onclick="startCamera()" style="margin-top:10px;padding:8px 16px;">重试</button>
            </div>
        `;
    }
}

// 拍照
function capturePhoto() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    const preview = document.getElementById('photoPreview');
    const previewImg = document.getElementById('previewImage');
    const captureBtn = document.getElementById('captureBtn');
    
    // 设置 canvas 尺寸与视频相同
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // 绘制视频帧到 canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 获取图片数据
    capturedImageData = canvas.toDataURL('image/jpeg', 0.9);
    
    // 显示预览
    previewImg.src = capturedImageData;
    preview.style.display = 'block';
    captureBtn.style.display = 'none';
    
    // 滚动到预览区域
    preview.scrollIntoView({ behavior: 'smooth' });
}

// 重拍
function retakePhoto() {
    const preview = document.getElementById('photoPreview');
    const captureBtn = document.getElementById('captureBtn');
    
    preview.style.display = 'none';
    captureBtn.style.display = 'inline-block';
    capturedImageData = null;
}

// 关闭摄像头
function stopCamera() {
    const video = document.getElementById('cameraVideo');
    const overlay = document.getElementById('cameraOverlay');
    const startBtn = document.getElementById('startCameraBtn');
    const captureBtn = document.getElementById('captureBtn');
    const stopBtn = document.getElementById('stopCameraBtn');
    const preview = document.getElementById('photoPreview');
    
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    video.srcObject = null;
    overlay.style.display = 'flex';
    overlay.innerHTML = '<div class="camera-status">摄像头已关闭</div>';
    startBtn.style.display = 'inline-block';
    captureBtn.style.display = 'none';
    stopBtn.style.display = 'none';
    preview.style.display = 'none';
    capturedImageData = null;
}

// 发送给助手
async function sendToAssistant() {
    if (!capturedImageData) {
        alert('请先拍照');
        return;
    }
    
    // 显示发送中
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '📤 发送中...';
    btn.disabled = true;
    
    try {
        // 压缩图片
        const compressedImage = await compressImage(capturedImageData, 1200);
        
        // 保存到本地存储（用于调试）
        localStorage.setItem('lastCapturedImage', compressedImage);
        
        // 显示成功提示和复制按钮
        alert('📸 照片已拍摄完成！\n\n你可以：\n1. 直接截图发给我\n2. 或复制图片链接（在下方）\n\n我会帮你看看这件物品~');
        
        // 显示图片在新窗口，方便用户截图或复制
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
            <html>
            <head><title>拍摄的照片 - 发给大喵助理</title></head>
            <body style="margin:0;display:flex;flex-direction:column;align-items:center;padding:20px;font-family:sans-serif;">
                <h2>📸 拍摄的照片</h2>
                <p>截图或右键保存，然后发给我</p>
                <img src="${compressedImage}" style="max-width:100%;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.2);">
                <p style="margin-top:20px;color:#666;">
                    <button onclick="copyImage()" style="padding:10px 20px;font-size:16px;">📋 复制图片</button>
                </p>
                <script>
                    function copyImage() {
                        const img = document.querySelector('img');
                        fetch(img.src)
                            .then(res => res.blob())
                            .then(blob => {
                                navigator.clipboard.write([
                                    new ClipboardItem({ 'image/png': blob })
                                ]);
                                alert('已复制到剪贴板！');
                            });
                    }
                <\/script>
            </body>
            </html>
        `);
        
    } catch (e) {
        alert('发送失败: ' + e.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// 压缩图片
function compressImage(dataUrl, maxWidth) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = dataUrl;
    });
}

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', init);
