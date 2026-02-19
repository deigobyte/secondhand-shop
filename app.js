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
    loadItems();
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
            <h1 onclick="showHome()">🏪 二手集市</h1>
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
            <h2>🏪 欢迎来到二手集市</h2>
            <p>每个人都可以开店卖货</p>
        </div>
        <div class="section-title">🔥 热门商品</div>
        <div class="grid" id="itemGrid">加载中...</div>
    `;
    loadItems();
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
            <div class="section-title">📦 店铺商品 (${data.items.length})</div>
            <div class="grid" id="itemGrid"></div>
        `;
        
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
        <div class="section-title">📦 我的商品</div>
        <div class="grid" id="myItemGrid">加载中...</div>
    `;
    
    loadMyItems();
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
                <div class="item-price">¥${item.price}</div>
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
function showItemDetail(id) {
    // 简化版，可以扩展
    console.log('查看商品:', id);
}

// 编辑商品
function editItem(id) {
    console.log('编辑商品:', id);
}

// 初始化
document.addEventListener('DOMContentLoaded', init);
