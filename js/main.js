// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    
    // 滚动时显示元素动画
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // 观察需要动画的元素
    const animateElements = document.querySelectorAll('.gallery-item, .detail-item, .about-content p');
    animateElements.forEach(el => {
        observer.observe(el);
    });
    
    // 照片画廊点击放大功能
    const galleryItems = document.querySelectorAll('.gallery-item img');
    galleryItems.forEach(img => {
        img.addEventListener('click', function() {
            createImageModal(this.src, this.alt);
        });
    });
    
    // 创建图片模态框
    function createImageModal(src, alt) {
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <img src="${src}" alt="${alt}">
            </div>
        `;
        
        // 添加模态框样式
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 2000;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            position: relative;
            max-width: 90%;
            max-height: 90%;
            text-align: center;
        `;
        
        const modalImg = modal.querySelector('img');
        modalImg.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        `;
        
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.style.cssText = `
            position: absolute;
            top: -40px;
            right: 0;
            color: white;
            font-size: 30px;
            cursor: pointer;
            z-index: 2001;
        `;
        
        document.body.appendChild(modal);
        
        // 显示动画
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
        
        // 关闭模态框
        function closeModal() {
            modal.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        }
        
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // ESC键关闭
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }
    
    // 页面加载完成后的初始化
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
    
    // 添加触摸手势支持（移动端）
    let startY = 0;
    let startX = 0;
    
    document.addEventListener('touchstart', function(e) {
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        if (!startY || !startX) return;
        
        const endY = e.changedTouches[0].clientY;
        const endX = e.changedTouches[0].clientX;
        
        const diffY = startY - endY;
        const diffX = startX - endX;
        
        // 检测向上滑动（可能用于返回顶部）
        if (Math.abs(diffY) > Math.abs(diffX) && diffY > 50) {
            // 可以添加返回顶部功能
        }
        
        startY = 0;
        startX = 0;
    }, { passive: true });
    
    // 性能优化：图片懒加载
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // 添加页面可见性API支持（暂停/恢复动画）
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // 页面不可见时暂停动画
            document.body.style.animationPlayState = 'paused';
        } else {
            // 页面可见时恢复动画
            document.body.style.animationPlayState = 'running';
        }
    });
    
    // 错误处理
    window.addEventListener('error', function(e) {
        console.log('页面加载错误:', e.error);
    });
    
    // 音乐播放控制
    const musicToggle = document.getElementById('music-toggle');
    const backgroundMusic = document.getElementById('background-music');
    let isPlaying = false;
    
    if (musicToggle && backgroundMusic) {
        // 设置音乐音量
        backgroundMusic.volume = 0.3; // 30%音量，避免过于突兀
        
        // 音乐播放/暂停控制
        musicToggle.addEventListener('click', function() {
            if (isPlaying) {
                backgroundMusic.pause();
                musicToggle.classList.remove('playing');
                isPlaying = false;
            } else {
                // 尝试播放音乐
                const playPromise = backgroundMusic.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        musicToggle.classList.add('playing');
                        isPlaying = true;
                    }).catch(error => {
                        console.log('音乐播放失败，可能是浏览器阻止了自动播放:', error);
                        // 显示提示信息
                        showMusicTip();
                    });
                }
            }
        });
        
        // 页面加载后自动尝试播放音乐
        setTimeout(() => {
            const playPromise = backgroundMusic.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    musicToggle.classList.add('playing');
                    isPlaying = true;
                }).catch(error => {
                    console.log('自动播放失败，用户需要手动点击播放');
                    // 不显示错误提示，因为这是正常的浏览器行为
                });
            }
        }, 1000);
        
        // 音乐播放结束时的处理
        backgroundMusic.addEventListener('ended', function() {
            musicToggle.classList.remove('playing');
            isPlaying = false;
        });
        
        // 音乐加载错误处理
        backgroundMusic.addEventListener('error', function() {
            console.log('音乐文件加载失败，请检查文件路径');
            musicToggle.style.display = 'none'; // 隐藏播放按钮
        });
    }
    
    // 显示音乐提示
    function showMusicTip() {
        const tip = document.createElement('div');
        tip.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 2000;
            font-size: 0.9rem;
            text-align: center;
        `;
        tip.textContent = '请点击右下角音乐按钮播放背景音乐';
        document.body.appendChild(tip);
        
        setTimeout(() => {
            document.body.removeChild(tip);
        }, 3000);
    }
    
    // 页面可见性变化时暂停/恢复音乐
    document.addEventListener('visibilitychange', function() {
        if (backgroundMusic) {
            if (document.hidden && isPlaying) {
                backgroundMusic.pause();
            } else if (!document.hidden && isPlaying) {
                backgroundMusic.play().catch(e => console.log('音乐恢复播放失败'));
            }
        }
    });
    
    // 控制台输出欢迎信息
    console.log('💕 欢迎参加小陈 & 小王的婚礼！💕');
    console.log('网站已加载完成，祝您浏览愉快！');
    console.log('🎵 点击右下角音乐按钮播放背景音乐');
});
