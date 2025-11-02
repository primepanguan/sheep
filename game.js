/**
 * 牛了个牛游戏类
 * 封装了游戏的所有逻辑和状态管理
 */
class NiuLeGeNiuGame {
    constructor() {
        // 游戏核心配置
        this.config = {
            slots: 7,                  // 卡槽数量
            baseLayers: 3,             // 基础层数
            increaseLayersPerLevel: 1, // 每关增加的层数
            baseCardsPerLayer: 12,     // 每层基础卡片数
            obstacleRate: 0.2,         // 障碍物比例
            cardTypes: [
                '🐑', '🌾', '🌱', '🌼', '🌳', '☀️', 
                '🌙', '⭐', '💧', '🔥', '🌵', '🍄',
                '🐔', '🐄', '🥕', '🌽', '🍃', '🌹'
            ],
            obstacleTypes: ['🪨', '🌑', '⛰️'],
            // 通关鼓励语句库
            encouragements: [
                "太牛了！这关对你来说简直小菜一碟！",
                "高手啊！你的观察力也太敏锐了吧！",
                "简直是消除大师！下一关准备好迎接挑战了吗？",
                "太厉害了！每一关都能轻松拿下，佩服佩服！",
                "节奏掌握得刚刚好，继续保持这个状态！",
                "没想到这么快就通关了，你是不是偷偷练过？",
                "这操作太丝滑了！期待你下一关的表现！",
                "不愧是你！难度升级也挡不住你的脚步！",
                "太精彩了！每一步都恰到好处，完美！",
                "已经开始期待你能闯到多少关了，加油！"
            ],
            // 打破记录鼓励语句库
            newRecordEncouragements: [
                "🎉 新纪录！你是游戏之王！🎉",
                "🏆 历史最佳！难以置信的表现！🏆",
                "🌟 突破极限！你创造了新的高度！🌟",
                "🔥 传奇诞生！这个纪录会被铭记！🔥",
                "💪 太强了！你已经超越了自己！💪",
                "👏 不可思议！这是历史性的时刻！👏",
                "⭐ 星光闪耀！你是真正的冠军！⭐",
                "🎊 记录刷新！你是游戏的统治者！🎊",
                "🎯 完美表现！新的纪录属于你！🎯",
                "✨ 你做到了！历史新高！未来可期！✨"
            ],
            // 游戏规则说明
            gameRules: [
                "1. 点击卡片将其放入下方卡槽",
                "2. 当卡槽中有3张相同图案的卡片时，它们将被自动消除",
                "3. 每张卡片最多只能被点击2次",
                "4. 消除所有卡片即可通关",
                "5. 卡槽最多可容纳7张卡片，满了则无法继续选择",
                "6. 每关有2次重排机会，可以重新排列顶层卡片",
                "7. 卡住时可以使用提示功能寻找可匹配的卡片"
            ],
            // 音乐配置
            music: {
                bgmPath: 'haijiduoduokai.mp3',
                volume: 0.5
            }
        };

        // 游戏状态
        this.gameState = {
            level: 1,
            layers: [],                // 多层卡片结构
            slots: [],                 // 卡槽中的卡片
            remainingCards: 0,         // 剩余可消除卡片
            totalCards: 0,             // 总卡片数（不含障碍物）
            isProcessing: false,       // 动画处理中
            refreshCount: 2,           // 重排次数
            highScore: this._getHighScore() // 最高分
        };

        // DOM 元素引用
        this.elements = {};
    }

    /**
     * 获取最高分记录
     * @private
     */
    _getHighScore() {
        try {
            const savedScore = localStorage.getItem('niulegeniu_highscore');
            return savedScore ? parseInt(savedScore, 10) : 0;
        } catch (e) {
            console.warn('无法获取最高分记录:', e);
            return 0;
        }
    }

    /**
     * 更新最高分记录
     * @param {number} score - 新的分数
     * @private
     */
    _updateHighScore(score) {
        try {
            localStorage.setItem('niulegeniu_highscore', score.toString());
            this.gameState.highScore = score;
        } catch (e) {
            console.warn('无法保存最高分记录:', e);
        }
    }

    /**
     * 检查用户是否已经看过游戏规则
     * @private
     */
    _hasSeenRules() {
        try {
            // 不再使用localStorage检查是否看过规则，总是返回false
            return false;
        } catch (e) {
            console.warn('无法获取规则查看状态:', e);
            return false;
        }
    }

    /**
     * 标记用户已看过游戏规则
     * @private
     */
    _markRulesAsSeen() {
        try {
            // 保留此方法以保持兼容性，但不再实际存储状态
            // localStorage.setItem('niulegeniu_hasSeenRules', 'true');
        } catch (e) {
            console.warn('无法保存规则查看状态:', e);
        }
    }

    /**
     * 创建并显示游戏规则弹窗
     * @private
     */
    _showRulesModal() {
        // 检查是否已存在规则弹窗
        let rulesModal = document.getElementById('rulesModal');
        if (rulesModal) {
            rulesModal.style.display = 'block';
            return;
        }

        // 创建规则弹窗容器
        rulesModal = document.createElement('div');
        rulesModal.id = 'rulesModal';
        rulesModal.className = 'rules-modal';
        rulesModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            font-family: 'Microsoft YaHei', sans-serif;
        `;

        // 创建规则内容面板
        const rulesContent = document.createElement('div');
        rulesContent.className = 'rules-content';
        rulesContent.style.cssText = `
            background: linear-gradient(135deg, #fff9e6, #fff3cc);
            padding: 30px;
            border-radius: 15px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            text-align: center;
            position: relative;
        `;

        // 创建标题
        const title = document.createElement('h2');
        title.style.cssText = `
            color: #d48806;
            margin-bottom: 20px;
            font-size: 28px;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
        `;
        title.innerHTML = '🐑 牛了个牛游戏规则 🎮';
        rulesContent.appendChild(title);

        // 创建规则列表
        const rulesList = document.createElement('ul');
        rulesList.style.cssText = `
            list-style: none;
            padding: 0;
            margin: 20px 0;
            text-align: left;
        `;

        this.config.gameRules.forEach(rule => {
            const ruleItem = document.createElement('li');
            ruleItem.style.cssText = `
                padding: 10px 15px;
                margin: 8px 0;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 8px;
                font-size: 16px;
                color: #333;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                transition: transform 0.2s, box-shadow 0.2s;
            `;
            ruleItem.textContent = rule;
            ruleItem.addEventListener('mouseenter', () => {
                ruleItem.style.transform = 'translateY(-2px)';
                ruleItem.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
            });
            ruleItem.addEventListener('mouseleave', () => {
                ruleItem.style.transform = 'translateY(0)';
                ruleItem.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
            });
            rulesList.appendChild(ruleItem);
        });
        rulesContent.appendChild(rulesList);

        // 创建开始按钮
        const startButton = document.createElement('button');
        startButton.textContent = '开始游戏';
        startButton.style.cssText = `
            background: linear-gradient(135deg, #ff9500, #ff6b00);
            color: white;
            border: none;
            padding: 12px 30px;
            font-size: 18px;
            font-weight: bold;
            border-radius: 25px;
            cursor: pointer;
            margin-top: 20px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 149, 0, 0.3);
        `;
        startButton.addEventListener('mouseenter', () => {
            startButton.style.transform = 'scale(1.05)';
            startButton.style.boxShadow = '0 6px 20px rgba(255, 149, 0, 0.4)';
        });
        startButton.addEventListener('mouseleave', () => {
            startButton.style.transform = 'scale(1)';
            startButton.style.boxShadow = '0 4px 15px rgba(255, 149, 0, 0.3)';
        });
        startButton.addEventListener('click', () => {
            this._markRulesAsSeen();
            rulesModal.style.display = 'none';
            // 开始游戏
            this._initGame();
        });
        rulesContent.appendChild(startButton);

        // 组装弹窗
        rulesModal.appendChild(rulesContent);
        document.body.appendChild(rulesModal);

        // 添加动画效果
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
            .rules-content {
                animation: fadeIn 0.5s ease-out;
            }
            /* 滚动条样式 */
            .rules-content::-webkit-scrollbar {
                width: 8px;
            }
            .rules-content::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.5);
                border-radius: 4px;
            }
            .rules-content::-webkit-scrollbar-thumb {
                background: rgba(212, 136, 6, 0.6);
                border-radius: 4px;
            }
            .rules-content::-webkit-scrollbar-thumb:hover {
                background: rgba(212, 136, 6, 0.8);
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 初始化背景音乐
     * @private
     */
    _initMusic() {
        try {
            // 创建音频元素
            this.audio = new Audio();
            this.audio.src = this.config.music.bgmPath;
            this.audio.volume = this.config.music.volume;
            this.audio.loop = true;
            this.audio.paused = true; // 初始暂停，等待用户交互后播放
        } catch (e) {
            console.warn('初始化背景音乐失败:', e);
        }
    }

    /**
     * 创建音乐控制按钮
     * @private
     */
    _createMusicControlButton() {
        // 检查是否已存在音乐按钮
        let musicButton = document.getElementById('musicControlBtn');
        if (musicButton) {
            return musicButton;
        }

        musicButton = document.createElement('button');
        musicButton.id = 'musicControlBtn';
        musicButton.textContent = '🔊';
        musicButton.style.cssText = `
            position: absolute;
            top: 20px;
            left: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #ff9500, #ff6b00);
            color: white;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
            z-index: 1000;
        `;

        // 添加悬停效果
        musicButton.addEventListener('mouseenter', () => {
            musicButton.style.transform = 'scale(1.1)';
            musicButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
        });
        musicButton.addEventListener('mouseleave', () => {
            musicButton.style.transform = 'scale(1)';
            musicButton.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
        });

        // 添加点击事件
        musicButton.addEventListener('click', () => {
            this._toggleMusic();
        });

        document.body.appendChild(musicButton);
        return musicButton;
    }

    /**
     * 切换音乐播放状态
     * @private
     */
    _toggleMusic() {
        if (!this.audio) return;

        try {
            const musicButton = document.getElementById('musicControlBtn');
            if (this.audio.paused) {
                this.audio.play().catch(error => {
                    console.warn('音乐播放失败:', error);
                });
                if (musicButton) musicButton.textContent = '🔊';
            } else {
                this.audio.pause();
                if (musicButton) musicButton.textContent = '🔇';
            }
        } catch (e) {
            console.warn('切换音乐状态失败:', e);
        }
    }

    /**
     * 尝试播放音乐（在用户交互后）
     * @private
     */
    _tryPlayMusic() {
        if (!this.audio || !this.audio.paused) return;

        try {
            this.audio.play().catch(error => {
                console.warn('尝试播放音乐失败:', error);
                // 用户可能尚未与页面交互，稍后再试
            });
        } catch (e) {
            console.warn('播放音乐异常:', e);
        }
    }

    /**
     * 初始化游戏，绑定DOM元素
     */
    init() {
        // 初始化背景音乐
        this._initMusic();
        
        // 创建音乐控制按钮
        const musicButton = this._createMusicControlButton();
        
        // 获取DOM元素
        this.elements = {
            gameArea: document.getElementById('gameArea'),
            cardSlot: document.getElementById('cardSlot'),
            levelEl: document.getElementById('level'),
            remainingEl: document.getElementById('remaining'),
            levelDisplay: document.getElementById('levelDisplay'),
            highScoreEl: document.getElementById('highScore') || this._createHighScoreElement(),
            restartBtn: document.getElementById('restartBtn'),
            hintBtn: document.getElementById('hintBtn'),
            refreshBtn: document.getElementById('refreshBtn'),
            musicButton: musicButton,
            defeatMessage: document.getElementById('defeatMessage'),
            victoryMessage: document.getElementById('victoryMessage'),
            encourageText: document.getElementById('encourageText'),
            completedLevel: document.getElementById('completedLevel'),
            newRecordEl: document.getElementById('newRecord') || this._createNewRecordElement(),
            defeatBtn: document.getElementById('defeatBtn'),
            victoryBtn: document.getElementById('victoryBtn'),
            overlay: document.getElementById('overlay')
        };
        
        // 更新最高分显示
        this._updateHighScoreDisplay();

        // 绑定事件监听器
        this._bindEvents();

        // 每次打开页面都显示规则
        this._showRulesModal();
    }

    /**
     * 创建最高分显示元素
     * @private
     */
    _createHighScoreElement() {
        const highScoreEl = document.createElement('div');
        highScoreEl.id = 'highScore';
        highScoreEl.className = 'high-score';
        highScoreEl.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.9);
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 16px;
            font-weight: bold;
            color: #333;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 100;
        `;
        document.body.appendChild(highScoreEl);
        return highScoreEl;
    }

    /**
     * 创建新纪录提示元素
     * @private
     */
    _createNewRecordElement() {
        const newRecordEl = document.createElement('div');
        newRecordEl.id = 'newRecord';
        newRecordEl.className = 'new-record';
        newRecordEl.style.cssText = `
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #FFD700, #FFA500);
            color: white;
            padding: 20px 30px;
            border-radius: 10px;
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: record-shine 1s ease-in-out infinite alternate;
        `;
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes record-shine {
                from { box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2); }
                to { box-shadow: 0 5px 30px rgba(255, 215, 0, 0.6); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(newRecordEl);
        return newRecordEl;
    }

    /**
     * 更新最高分显示
     * @private
     */
    _updateHighScoreDisplay() {
        if (this.elements.highScoreEl) {
            this.elements.highScoreEl.textContent = `🏆 最高分: ${this.gameState.highScore}关`;
        }
    }

    /**
     * 显示新纪录提示
     * @private
     */
    _showNewRecordMessage() {
        if (this.elements.newRecordEl) {
            const randomEncourage = this.config.newRecordEncouragements[
                Math.floor(Math.random() * this.config.newRecordEncouragements.length)
            ];
            this.elements.newRecordEl.textContent = randomEncourage;
            this.elements.newRecordEl.style.display = 'block';
            
            // 3秒后隐藏
            setTimeout(() => {
                this.elements.newRecordEl.style.display = 'none';
            }, 3000);
        }
    }

    /**
     * 绑定游戏事件
     * @private
     */
    _bindEvents() {
        // 添加全局点击事件，用于在用户交互后尝试播放音乐
        document.addEventListener('click', () => {
            this._tryPlayMusic();
            // 使用函数引用而不是arguments.callee
            document.removeEventListener('click', function handler() {
                this._tryPlayMusic();
            });
        }, { once: true });

        this.elements.restartBtn.addEventListener('click', () => {
            this._tryPlayMusic();
            this.gameState.level = 1;
            this._initGame();
        });

        this.elements.hintBtn.addEventListener('click', () => {
            this._tryPlayMusic();
            this._showHint();
        });
        this.elements.refreshBtn.addEventListener('click', () => {
            this._tryPlayMusic();
            this._refreshCards();
        });

        // 胜利后继续挑战（进入下一关）
        this.elements.victoryBtn.addEventListener('click', () => {
            this._tryPlayMusic();
            this.gameState.level++;
            this._initGame();
        });

        // 失败后重新开始
        this.elements.defeatBtn.addEventListener('click', () => {
            this._tryPlayMusic();
            this.gameState.level = 1;
            this._initGame();
        });
        
        // 规则弹窗开始按钮的点击事件也应该触发音乐播放
        document.addEventListener('click', (e) => {
            if (e.target && e.target.textContent === '开始游戏') {
                this._tryPlayMusic();
            }
        });
    }

    /**
     * 初始化游戏状态和UI
     * @private
     */
    _initGame() {
        // 重置游戏状态
        this.gameState.layers = [];
        this.gameState.slots = [];
        this.gameState.remainingCards = 0;
        this.gameState.totalCards = 0;
        this.gameState.isProcessing = false;
        this.gameState.refreshCount = 2;
        // 确保高分记录已加载
        if (!this.gameState.highScore) {
            this.gameState.highScore = this._getHighScore();
        }
        
        // 更新UI
        this.elements.levelEl.textContent = this.gameState.level;
        this.elements.levelDisplay.textContent = this.gameState.level;
        this.elements.gameArea.innerHTML = `<div class="level-indicator">第${this.gameState.level}关</div>`;
        this.elements.cardSlot.innerHTML = '';
        this.elements.cardSlot.classList.remove('slot-full');
        this.elements.refreshBtn.textContent = `重排(${this.gameState.refreshCount})`;
        
        // 隐藏消息
        this.elements.overlay.classList.remove('show');
        this.elements.defeatMessage.classList.remove('show');
        this.elements.victoryMessage.classList.remove('show');
        
        // 生成多层卡片
        this._generateLayers();
        
        // 更新剩余卡片数
        this.elements.remainingEl.textContent = this.gameState.remainingCards;
    }

    /**
     * 生成多层卡片结构
     * @private
     */
    _generateLayers() {
        const totalLayers = this.config.baseLayers + (this.gameState.level - 1) * this.config.increaseLayersPerLevel;
        const cardAreaWidth = this.elements.gameArea.clientWidth - 40;
        const cardAreaHeight = this.elements.gameArea.clientHeight - 40;
        const cardSize = 65;
        
        // 每层卡片位置范围逐渐缩小，形成堆叠效果
        for (let layer = 0; layer < totalLayers; layer++) {
            const layerCards = [];
            const layerSizeRatio = 1 - (layer / totalLayers) * 0.5; // 每层缩小比例
            const layerWidth = cardAreaWidth * layerSizeRatio;
            const layerHeight = cardAreaHeight * layerSizeRatio;
            const startX = (cardAreaWidth - layerWidth) / 2 + 20;
            const startY = (cardAreaHeight - layerHeight) / 2 + 20;
            
            // 每层卡片数量递增
            const cardsInLayer = this.config.baseCardsPerLayer + layer * 4 + (this.gameState.level - 1) * 2;
            
            // 随机选择卡片类型（确保每种类型有3的倍数）
            const typesCount = Math.ceil(cardsInLayer / 3);
            const shuffledTypes = [...this.config.cardTypes].sort(() => 0.5 - Math.random());
            const selectedTypes = shuffledTypes.slice(0, typesCount);
            
            // 生成卡片数据
            let typeIndex = 0;
            let typeCounter = 0;
            
            for (let i = 0; i < cardsInLayer; i++) {
                // 随机位置（限制在当前层范围内）
                const x = startX + Math.floor(Math.random() * (layerWidth - cardSize));
                const y = startY + Math.floor(Math.random() * (layerHeight - cardSize));
                
                // 随机生成障碍物（随关卡提升增加比例）
                const adjustedObstacleRate = Math.min(
                    this.config.obstacleRate + (this.gameState.level - 1) * 0.03, 
                    0.4
                );
                const isObstacle = Math.random() < adjustedObstacleRate && layer < totalLayers - 1;
                
                let cardType;
                if (isObstacle) {
                    cardType = this.config.obstacleTypes[Math.floor(Math.random() * this.config.obstacleTypes.length)];
                } else {
                    cardType = selectedTypes[typeIndex];
                    typeCounter++;
                    if (typeCounter >= 3) {
                        typeIndex = (typeIndex + 1) % selectedTypes.length;
                        typeCounter = 0;
                    }
                    this.gameState.remainingCards++;
                    this.gameState.totalCards++;
                }
                
                layerCards.push({
                    id: `card-${layer}-${i}`,
                    type: cardType,
                    layer: layer,
                    x: x,
                    y: y,
                    matched: false,
                    isObstacle: isObstacle,
                    isLocked: layer < totalLayers - 1, // 非顶层卡片默认锁定
                    clickCount: 0, // 记录点击次数
                    maxClicks: 2 // 最大点击次数
                });
            }
            
            this.gameState.layers.push(layerCards);
        }
        
        // 创建卡片元素
        this._renderAllLayers();
    }

    /**
     * 渲染所有层卡片
     * @private
     */
    _renderAllLayers() {
        this.gameState.layers.forEach(layer => {
            layer.forEach(card => {
                if (!card.matched) {
                    this._renderCard(card);
                }
            });
        });
        
        // 检查顶层卡片锁定状态
        this._updateTopLayerLockStatus();
    }

    /**
     * 渲染单张卡片
     * @param {Object} card - 卡片数据
     * @private
     */
    _renderCard(card) {
        const cardEl = document.createElement('div');
        cardEl.id = card.id;
        cardEl.className = 'card';
        if (card.isLocked) cardEl.classList.add('locked');
        if (card.isObstacle) cardEl.classList.add('obstacle');
        if (card.clickCount >= card.maxClicks) cardEl.classList.add('max-clicks');
        cardEl.style.left = `${card.x}px`;
        cardEl.style.top = `${card.y}px`;
        cardEl.style.zIndex = card.layer + 1; // 高层卡片z-index更高
        cardEl.innerHTML = card.type;
        cardEl.dataset.type = card.type;
        cardEl.dataset.layer = card.layer;
        cardEl.dataset.index = this.gameState.layers[card.layer].findIndex(c => c.id === card.id);
        
        // 添加点击次数显示
        const clickCountEl = document.createElement('div');
        clickCountEl.className = 'click-count';
        clickCountEl.textContent = `${card.clickCount}/${card.maxClicks}`;
        clickCountEl.style.cssText = `
            position: absolute;
            bottom: 2px;
            right: 2px;
            font-size: 10px;
            font-weight: bold;
            color: rgba(255, 255, 255, 0.8);
            background: rgba(0, 0, 0, 0.5);
            padding: 1px 4px;
            border-radius: 4px;
        `;
        cardEl.appendChild(clickCountEl);
        
        // 非锁定卡片添加点击事件
        if (!card.isLocked && !card.isObstacle && card.clickCount < card.maxClicks) {
            cardEl.addEventListener('click', () => this._selectCard(card.layer, parseInt(cardEl.dataset.index)));
        }
        
        this.elements.gameArea.appendChild(cardEl);
        // 添加点击次数相关样式
        this._addClickCountStyles();
    }
    
    /**
     * 添加点击次数相关的CSS样式
     * @private
     */
    _addClickCountStyles() {
        // 检查样式是否已添加
        if (document.getElementById('click-count-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'click-count-styles';
        style.textContent = `
            .card.max-clicks {
                opacity: 0.6;
                cursor: not-allowed;
            }
            .card.max-clicks::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 5px,
                    rgba(255, 0, 0, 0.2) 5px,
                    rgba(255, 0, 0, 0.2) 10px
                );
                pointer-events: none;
                border-radius: 5px;
            }
            .card.clicked-once {
                border: 2px solid orange;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * 更新卡片点击次数显示
     * @param {Object} card - 卡片数据
     * @private
     */
    _updateCardClickCount(card) {
        const cardEl = document.getElementById(card.id);
        if (cardEl) {
            const clickCountEl = cardEl.querySelector('.click-count');
            if (clickCountEl) {
                clickCountEl.textContent = `${card.clickCount}/${card.maxClicks}`;
            }
            
            // 更新卡片样式
            if (card.clickCount >= card.maxClicks) {
                cardEl.classList.add('max-clicks');
                // 移除点击事件
                const newCardEl = cardEl.cloneNode(true);
                cardEl.parentNode.replaceChild(newCardEl, cardEl);
            } else if (card.clickCount === 1) {
                cardEl.classList.add('clicked-once');
            }
        }
    }

    /**
     * 更新顶层卡片锁定状态
     * @private
     */
    _updateTopLayerLockStatus() {
        const totalLayers = this.gameState.layers.length;
        
        // 从顶层向下检查
        for (let layer = totalLayers - 1; layer >= 0; layer--) {
            const currentLayer = this.gameState.layers[layer];
            const isTopLayer = layer === totalLayers - 1;
            
            currentLayer.forEach((card, index) => {
                // 顶层卡片或被上层已消除卡片覆盖的卡片解锁
                if (isTopLayer || this._isCardUncovered(layer, index)) {
                    card.isLocked = false;
                    const cardEl = document.getElementById(card.id);
                    if (cardEl) {
                        cardEl.classList.remove('locked');
                        // 如果卡片还可以点击，重新绑定点击事件
                        if (!card.isObstacle && card.clickCount < card.maxClicks) {
                            // 先移除所有事件监听器
                            const newCardEl = cardEl.cloneNode(true);
                            cardEl.parentNode.replaceChild(newCardEl, cardEl);
                            // 重新添加点击事件
                            newCardEl.addEventListener('click', () => this._selectCard(card.layer, index));
                        }
                    }
                } else {
                    card.isLocked = true;
                    const cardEl = document.getElementById(card.id);
                    if (cardEl) cardEl.classList.add('locked');
                }
            });
        }
    }

    /**
     * 检查卡片是否被上层卡片覆盖
     * @param {number} layer - 卡片所在层
     * @param {number} index - 卡片在层中的索引
     * @returns {boolean} 是否未被覆盖
     * @private
     */
    _isCardUncovered(layer, index) {
        const card = this.gameState.layers[layer][index];
        const cardSize = 65;
        const cardHalf = cardSize / 2;
        const cardCenterX = card.x + cardHalf;
        const cardCenterY = card.y + cardHalf;
        
        // 检查所有上层是否有未消除的卡片覆盖当前卡片中心
        for (let upperLayer = layer + 1; upperLayer < this.gameState.layers.length; upperLayer++) {
            const upperCards = this.gameState.layers[upperLayer];
            
            for (const upperCard of upperCards) {
                if (!upperCard.matched) {
                    const upperCenterX = upperCard.x + cardHalf;
                    const upperCenterY = upperCard.y + cardHalf;
                    const distance = Math.hypot(cardCenterX - upperCenterX, cardCenterY - upperCenterY);
                    
                    // 如果距离小于卡片一半，视为被覆盖
                    if (distance < cardHalf * 0.8) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    /**
     * 选择卡片
     * @param {number} layer - 卡片所在层
     * @param {number} index - 卡片在层中的索引
     * @private
     */
    _selectCard(layer, index) {
        if (this.gameState.isProcessing) return;
        
        const card = this.gameState.layers[layer][index];
        if (card.matched || card.isLocked || card.isObstacle || card.clickCount >= card.maxClicks) return;
        
        // 检查卡槽是否已满
        if (this.gameState.slots.length >= this.config.slots) {
            this.elements.cardSlot.classList.add('slot-full');
            setTimeout(() => this.elements.cardSlot.classList.remove('slot-full'), 1000);
            return;
        }
        
        // 增加点击次数
        card.clickCount++;
        
        // 添加到卡槽
        this.gameState.slots.push({ ...card, layer, index });
        
        // 更新UI
        const cardEl = document.getElementById(card.id);
        cardEl.classList.add('selected');
        this._updateCardClickCount(card);
        this._updateCardSlot();
        
        // 检查是否可以消除
        this._checkForMatch();
    }

    /**
     * 更新卡槽显示
     * @private
     */
    _updateCardSlot() {
        this.elements.cardSlot.innerHTML = '';
        
        this.gameState.slots.forEach((card, slotIndex) => {
            const slotCard = document.createElement('div');
            slotCard.className = 'slot-card';
            slotCard.innerHTML = card.type;
            slotCard.dataset.slotIndex = slotIndex;
            
            // 点击移除卡槽中的卡片
            slotCard.addEventListener('click', (e) => {
                e.stopPropagation();
                this._removeFromSlot(slotIndex);
            });
            
            this.elements.cardSlot.appendChild(slotCard);
        });
    }

    /**
     * 从卡槽移除卡片
     * @param {number} slotIndex - 卡片在卡槽中的索引
     * @private
     */
    _removeFromSlot(slotIndex) {
        if (this.gameState.isProcessing) return;
        
        const card = this.gameState.slots[slotIndex];
        const cardEl = document.getElementById(card.id);
        if (cardEl) cardEl.classList.remove('selected');
        
        // 从卡槽中移除
        this.gameState.slots.splice(slotIndex, 1);
        this._updateCardSlot();
    }

    /**
     * 检查是否可以匹配（3个相同）
     * @private
     */
    _checkForMatch() {
        if (this.gameState.slots.length < 3) return;
        
        // 统计卡槽中各类型数量
        const typeCounts = {};
        this.gameState.slots.forEach(card => {
            typeCounts[card.type] = (typeCounts[card.type] || 0) + 1;
        });
        
        // 寻找可匹配的类型（数量>=3）
        let matchType = null;
        for (const type in typeCounts) {
            if (typeCounts[type] >= 3) {
                matchType = type;
                break;
            }
        }
        
        if (matchType) {
            // 找到所有该类型的卡片并消除
            const matchIndices = this.gameState.slots
                .map((card, index) => ({ ...card, slotIndex: index }))
                .filter(card => card.type === matchType)
                .slice(0, 3); // 每次只消除3个
            
            this._eliminateCards(matchIndices);
        }
    }

    /**
     * 消除卡片
     * @param {Array} matchIndices - 要消除的卡片索引数组
     * @private
     */
    _eliminateCards(matchIndices) {
        this.gameState.isProcessing = true;
        
        // 标记卡片为已匹配
        matchIndices.forEach(item => {
            const card = this.gameState.layers[item.layer][item.index];
            card.matched = true;
            const cardEl = document.getElementById(card.id);
            cardEl.classList.add('matched');
            cardEl.classList.remove('selected');
        });
        
        // 从卡槽中移除
        const slotIndicesToRemove = matchIndices.map(item => item.slotIndex).sort((a, b) => b - a);
        slotIndicesToRemove.forEach(index => {
            this.gameState.slots.splice(index, 1);
        });
        
        // 更新剩余卡片数
        this.gameState.remainingCards -= 3;
        this.elements.remainingEl.textContent = this.gameState.remainingCards;
        
        // 延迟后更新UI
        setTimeout(() => {
            // 移除卡片元素
            matchIndices.forEach(item => {
                const cardEl = document.getElementById(this.gameState.layers[item.layer][item.index].id);
                if (cardEl) this.elements.gameArea.removeChild(cardEl);
            });
            
            this._updateCardSlot();
            
            // 检查是否有下层卡片解锁
            this._updateTopLayerLockStatus();
            
            this.gameState.isProcessing = false;
            
            // 检查游戏状态
            this._checkGameStatus();
        }, 400);
    }

    /**
     * 检查游戏状态（胜利/失败）
     * @private
     */
    _checkGameStatus() {
        // 胜利条件：所有可消除卡片都已消除
        if (this.gameState.remainingCards <= 0) {
            setTimeout(() => this._showVictoryMessage(), 500);
            return;
        }
        
        // 失败条件：卡槽已满且无法消除，同时没有可点击的卡片
        if (this.gameState.slots.length >= this.config.slots && !this._canEliminateAny() && !this._hasUnlockedCards()) {
            this._showDefeatMessage();
        }
    }

    /**
     * 显示胜利鼓励界面
     * @private
     */
    _showVictoryMessage() {
        // 检查是否打破最高分记录
        let randomEncourage;
        let isNewRecord = false;
        
        if (this.gameState.level > this.gameState.highScore) {
            // 打破记录！
            this._updateHighScore(this.gameState.level);
            this._updateHighScoreDisplay();
            this._showNewRecordMessage();
            
            // 使用特别的鼓励语句
            randomEncourage = this.config.newRecordEncouragements[
                Math.floor(Math.random() * this.config.newRecordEncouragements.length)
            ];
            isNewRecord = true;
        } else {
            // 普通通关鼓励
            randomEncourage = this.config.encouragements[
                Math.floor(Math.random() * this.config.encouragements.length)
            ];
        }
        
        // 更新鼓励信息
        this.elements.completedLevel.textContent = this.gameState.level;
        this.elements.encourageText.textContent = randomEncourage;
        
        // 如果是新纪录，添加特殊标记
        if (isNewRecord) {
            this.elements.encourageText.innerHTML += ' <span style="color: gold; font-weight: bold;">(新纪录！)</span>';
        }
        
        // 随机胜利表情
        const victoryEmojis = ['🎉', '🏆', '🌟', '🥳', '👏', '💪'];
        document.querySelector('.message.victory .emoji').textContent = 
            victoryEmojis[Math.floor(Math.random() * victoryEmojis.length)];
        
        // 显示胜利界面
        this.elements.overlay.classList.add('show');
        this.elements.victoryMessage.classList.add('show');
    }

    /**
     * 显示失败界面
     * @private
     */
    _showDefeatMessage() {
        this.elements.overlay.classList.add('show');
        this.elements.defeatMessage.classList.add('show');
    }

    /**
     * 检查是否有可消除的卡片
     * @returns {boolean} 是否有可消除的卡片
     * @private
     */
    _canEliminateAny() {
        const typeCounts = {};
        this.gameState.slots.forEach(card => {
            typeCounts[card.type] = (typeCounts[card.type] || 0) + 1;
        });
        
        for (const type in typeCounts) {
            if (typeCounts[type] >= 3) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检查是否有未锁定且可点击的卡片
     * @returns {boolean} 是否有可点击的卡片
     * @private
     */
    _hasUnlockedCards() {
        for (const layer of this.gameState.layers) {
            for (const card of layer) {
                if (!card.matched && !card.isLocked && !card.isObstacle && card.clickCount < card.maxClicks) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 重排功能
     * @private
     */
    _refreshCards() {
        if (this.gameState.isProcessing || this.gameState.refreshCount <= 0) return;
        
        this.gameState.refreshCount--;
        this.elements.refreshBtn.textContent = `重排(${this.gameState.refreshCount})`;
        
        // 只重排顶层未锁定的卡片
        const topLayerIndex = this.gameState.layers.length - 1;
        const topLayer = this.gameState.layers[topLayerIndex];
        const unlockedCards = topLayer.filter(card => !card.matched && !card.isLocked && !card.isObstacle);
        
        if (unlockedCards.length <= 1) return;
        
        // 随机重新定位
        const cardAreaWidth = this.elements.gameArea.clientWidth - 40;
        const cardAreaHeight = this.elements.gameArea.clientHeight - 40;
        const cardSize = 65;
        
        unlockedCards.forEach(card => {
            card.x = 20 + Math.floor(Math.random() * (cardAreaWidth - cardSize));
            card.y = 20 + Math.floor(Math.random() * (cardAreaHeight - cardSize));
            
            const cardEl = document.getElementById(card.id);
            if (cardEl) {
                cardEl.style.left = `${card.x}px`;
                cardEl.style.top = `${card.y}px`;
            }
        });
    }

    /**
     * 显示提示
     * @private
     */
    _showHint() {
        if (this.gameState.isProcessing) return;
        
        // 寻找可以匹配的三个卡片
        const allUnlockedCards = [];
        
        this.gameState.layers.forEach((layer, layerIndex) => {
            layer.forEach((card, cardIndex) => {
                if (!card.matched && !card.isLocked && !card.isObstacle && card.clickCount < card.maxClicks) {
                    allUnlockedCards.push({ ...card, layer: layerIndex, index: cardIndex });
                }
            });
        });
        
        // 按类型分组
        const groups = {};
        allUnlockedCards.forEach(card => {
            if (!groups[card.type]) {
                groups[card.type] = [];
            }
            groups[card.type].push(card);
        });
        
        // 找到有至少3个卡片的组
        let hintGroup = null;
        for (const type in groups) {
            if (groups[type].length >= 3) {
                hintGroup = groups[type];
                break;
            }
        }
        
        if (hintGroup) {
            // 高亮提示的卡片
            hintGroup.slice(0, 3).forEach(card => {
                const cardEl = document.getElementById(card.id);
                cardEl.style.animation = 'none';
                setTimeout(() => {
                    cardEl.style.animation = 'matched 0.5s ease-in-out infinite alternate';
                }, 10);
                
                // 3秒后取消高亮
                setTimeout(() => {
                    cardEl.style.animation = '';
                }, 3000);
            });
        } else {
            alert('没有可匹配的卡片组合，尝试重排或移除卡槽卡片');
        }
    }
}

// 当DOM加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new NiuLeGeNiuGame();
    game.init();
});