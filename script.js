document.addEventListener('DOMContentLoaded', function() {
    // Make all links open in a new tab
    makeAllLinksOpenInNewTab();

    // Set up MutationObserver to watch for dynamically added links
    setupLinkObserver();

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Close menu when a link is clicked
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }
    
    // Load publications data from JSON file
    loadPublications();
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only apply smooth scrolling to hash links (internal page links)
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    // Account for the sticky nav
                    const navHeight = document.querySelector('.top-nav').offsetHeight;
                    const targetPosition = targetSection.offsetTop - navHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update active class
                    navLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                }
            }
        });
    });
    
    // Update active nav link on scroll
    window.addEventListener('scroll', function() {
        let current = '';
        const sections = document.querySelectorAll('section[id]');
        const navHeight = document.querySelector('.top-nav').offsetHeight;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop - navHeight - 100) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkTarget = link.getAttribute('href').substring(1);
            // Handle both homepage and about pointing to the same section
            if (linkTarget === current || 
                (current === 'homepage' && linkTarget === 'about') ||
                (current === 'about' && linkTarget === 'homepage')) {
                link.classList.add('active');
            }
        });
    });

    // Load news data
    let newsJsonPath = 'data/news.json';
    if (window.location.pathname.includes('/pages/')) {
        newsJsonPath = '../data/news.json';
    }
    
    fetch(newsJsonPath)
        .then(response => response.json())
        .then(data => {
            // Check if we're on the homepage
            const latestNewsSection = document.getElementById('latest-news');
            if (latestNewsSection) {
                // On homepage - show limited news (first 8 items)
                renderNewsItems(data.slice(0, 8), 'news-container');
            }
            
            // Check if we're on the all-news page
            const allNewsSection = document.getElementById('all-news');
            if (allNewsSection) {
                // On all-news page - show all news items
                renderNewsItems(data, 'all-news-container');
            }
        })
        .catch(error => {
            console.error('Error loading news data:', error);
        });
    
    // Load honors data
    let honorsJsonPath = 'data/honors.json';
    if (window.location.pathname.includes('/pages/')) {
        honorsJsonPath = '../data/honors.json';
    }
    
    fetch(honorsJsonPath)
        .then(response => response.json())
        .then(data => {
            // Check if we're on the homepage
            const honorsSection = document.getElementById('honors');
            if (honorsSection) {
                // On homepage - show limited honors (first 8 items)
                renderHonorsItems(data.slice(0, 8), 'honors-container');
            }
            
            // Check if we're on the all-honors page
            const allHonorsSection = document.getElementById('all-honors');
            if (allHonorsSection) {
                // On all-honors page - show all honors items
                renderHonorsItems(data, 'all-honors-container');
            }
        })
        .catch(error => {
            console.error('Error loading honors data:', error);
        });
});

// Function to load publications from JSON
function loadPublications() {
    let publicationsJsonPath = 'data/publications.json';
    if (window.location.pathname.includes('/pages/')) {
        publicationsJsonPath = '../data/publications.json';
    }

    const publicationsList = document.querySelector('.publications-list');
    if (!publicationsList) {
        console.warn('Publications list not found');
        return;
    }
    
    // Clear existing publications
    publicationsList.innerHTML = '';
    
    fetch(publicationsJsonPath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(publications => {
            console.log('Loaded publications:', publications.length);
            
            let pubsToShow = publications;
            
            // Sort by year descending
            pubsToShow.sort((a, b) => {
                const yearA = a.year ? parseInt(a.year) : 9999;
                const yearB = b.year ? parseInt(b.year) : 9999;
                return yearB - yearA;
            });

            // Group by year
            const pubsByYear = {};
            pubsToShow.forEach(pub => {
                const year = pub.year || 'Preprint';
                if (!pubsByYear[year]) {
                    pubsByYear[year] = [];
                }
                pubsByYear[year].push(pub);
            });

            const sortedYears = Object.keys(pubsByYear).sort((a, b) => {
                if (a === 'Preprint') return -1;
                if (b === 'Preprint') return 1;
                return b - a;
            });

            // Render groups
            sortedYears.forEach(year => {
                const yearGroup = document.createElement('div');
                yearGroup.className = 'pub-year-group';

                const yearHeader = document.createElement('h3');
                yearHeader.className = 'pub-year-header';
                yearHeader.textContent = `-${year}-`;
                yearGroup.appendChild(yearHeader);

                const ul = document.createElement('ul');
                ul.className = 'pub-list-ul';

                pubsByYear[year].forEach(pub => {
                    const li = document.createElement('li');
                    // 修改：让 li 变成垂直排列 (flex-col)，这样 MainRow 和 BibBox 就会上下排列
                    li.className = 'pub-list-item flex flex-col items-start gap-2'; 

                    // --- 创建 MainRow: 包含原本的文字内容和图片 ---
                    const mainRow = document.createElement('div');
                    mainRow.className = 'flex w-full justify-between gap-4'; // 横向排列，撑满宽度

                    // Wrapper for text content
                    const contentWrapper = document.createElement('div');
                    contentWrapper.className = 'pub-content-wrapper flex-grow'; // 让文字区域占据剩余空间

                    // --- Line 1: [Venue] Title ---
                    const line1 = document.createElement('div');
                    line1.className = 'pub-line-1';

                    const venueTagSpan = document.createElement('span');
                    const venueShort = getVenueShortName(pub.venue, pub.year);
                    venueTagSpan.textContent = `[${venueShort}]`;
                    venueTagSpan.className = 'pub-venue-tag';
                    if (venueShort.toLowerCase().includes('arxiv') || venueShort.toLowerCase().includes('preprint')) {
                        venueTagSpan.classList.add('tag-arxiv');
                    } else {
                        venueTagSpan.classList.add('tag-conference');
                    }
                    line1.appendChild(venueTagSpan);

                    const titleSpan = document.createElement('span');
                    titleSpan.className = 'pub-title-text';
                    titleSpan.textContent = pub.title;
                    line1.appendChild(titleSpan);
                    
                    // Paper/Code Buttons
                    if (pub.tags) {
                        pub.tags.forEach(tag => {
                            if (tag.link && tag.link !== '#') {
                                const btn = document.createElement('a');
                                btn.className = 'pub-link-btn';
                                btn.href = tag.link;
                                btn.target = '_blank';
                                if (tag.text === 'Paper') {
                                    btn.textContent = 'PDF';
                                } else {
                                    btn.textContent = tag.text;
                                }
                                line1.appendChild(btn);
                            }
                        });
                    }

                    // --- BibTeX Button Logic ---
                    let bibBox = null;
                    if (pub.bibtex) {
                        const btnBib = document.createElement('button');
                        btnBib.className = 'pub-link-btn'; 
                        btnBib.textContent = 'Bib';
                        
                        // 创建 BibTeX 显示容器
                        bibBox = document.createElement('div');
                        // 样式修改重点：
                        // 1. relative: 为了里面放绝对定位的复制按钮
                        // 2. w-full: 占满整行宽度
                        // 3. whitespace-pre-wrap: 自动换行，禁止横向滚动
                        // 4. break-all: 强制打断长单词，防止溢出
                        bibBox.className = 'pub-bibtex-box hidden relative w-full mt-2 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 whitespace-pre-wrap break-all';
                        
                        // BibText 内容
                        const codeContent = document.createElement('div');
                        codeContent.textContent = pub.bibtex;
                        bibBox.appendChild(codeContent);

                        // --- 创建复制按钮 ---
                        const copyBtn = document.createElement('button');
                        // 定位到右上角
                        copyBtn.className = 'absolute top-2 right-2 p-1.5 text-slate-400 hover:text-accent transition-colors bg-white/50 rounded hover:bg-white';
                        copyBtn.title = 'Copy BibTeX';
                        copyBtn.innerHTML = '<i class="far fa-copy"></i>'; // 使用 FontAwesome 图标

                        // 复制功能逻辑
                        copyBtn.onclick = function(e) {
                            e.stopPropagation(); // 防止触发其他点击事件
                            navigator.clipboard.writeText(pub.bibtex).then(() => {
                                // 复制成功的反馈效果
                                const originalIcon = copyBtn.innerHTML;
                                copyBtn.innerHTML = '<i class="fas fa-check text-green-500"></i>';
                                setTimeout(() => {
                                    copyBtn.innerHTML = originalIcon;
                                }, 2000);
                            }).catch(err => {
                                console.error('Failed to copy: ', err);
                            });
                        };
                        bibBox.appendChild(copyBtn);

                        // 点击 Toggle 显示/隐藏
                        btnBib.onclick = function() {
                            if (bibBox.classList.contains('hidden')) {
                                bibBox.classList.remove('hidden');
                                btnBib.classList.add('active');
                            } else {
                                bibBox.classList.add('hidden');
                                btnBib.classList.remove('active');
                            }
                        };
                        
                        line1.appendChild(btnBib);
                    }

                    // --- Thumbnail Logic (Default Show) ---
                    let thumbBox = null;
                    if (pub.thumbnail) {
                        li.classList.add('with-thumbnail-expanded');

                        thumbBox = document.createElement('div');
                        thumbBox.className = 'pub-thumbnail-box flex-shrink-0'; // 防止图片被压缩
                        thumbBox.style.display = 'block';
                        
                        const thumbImg = document.createElement('img');
                        thumbImg.src = pub.thumbnail;
                        thumbImg.alt = 'Publication Thumbnail';
                        thumbBox.appendChild(thumbImg);
                    }
                    
                    contentWrapper.appendChild(line1);

                    // --- Line 2: Authors ---
                    const line2 = document.createElement('div');
                    line2.className = 'pub-line-2';
                    line2.innerHTML = pub.authors; 
                    contentWrapper.appendChild(line2);

                    // --- Line 3: Venue Details ---
                    const line3 = document.createElement('div');
                    line3.className = 'pub-line-3';
                    
                    let highlightText = pub.highlight || '';
                    let badgeText = '';
                    if (highlightText.toLowerCase().includes('oral')) badgeText = 'Oral';
                    else if (highlightText.toLowerCase().includes('spotlight')) badgeText = 'Spotlight';
                    
                    if (badgeText) {
                        const badge = document.createElement('span');
                        badge.className = 'pub-badge-highlight';
                        badge.textContent = badgeText;
                        line3.appendChild(badge);
                    }

                    const fullVenueName = getVenueFullName(pub.venue, pub.year);
                    const venueNameSpan = document.createElement('span');
                    venueNameSpan.textContent = fullVenueName;
                    line3.appendChild(venueNameSpan);

                    const ccfRank = getCCFRank(fullVenueName, pub.venue);
                    if (ccfRank) {
                        const rankSpan = document.createElement('span');
                        rankSpan.className = `ccf-rank ccf-${ccfRank.toLowerCase()}`;
                        rankSpan.textContent = `(CCF-${ccfRank})`;
                        line3.appendChild(rankSpan);
                    }

                    contentWrapper.appendChild(line3);
                    
                    // --- 组装 DOM 结构 ---
                    
                    // 1. 把文字内容加入第一行容器
                    mainRow.appendChild(contentWrapper);

                    // 2. 如果有图片，把图片加入第一行容器 (放在右侧)
                    if (thumbBox) {
                        mainRow.appendChild(thumbBox);
                    }

                    // 3. 把第一行容器加入 LI
                    li.appendChild(mainRow);
                    
                    // 4. 如果有 BibTeX，把它加入 LI (作为第二行，位于下方)
                    if (bibBox) {
                        li.appendChild(bibBox);
                    }

                    ul.appendChild(li);
                });

                yearGroup.appendChild(ul);
                publicationsList.appendChild(yearGroup);
            });
        })
        .catch(error => {
            console.error('Error loading publications data:', error);
            publicationsList.innerHTML = '<p>Failed to load publications. Please check the console for details.</p>';
        });
}

function getVenueShortName(venueStr, year) {
    if (!venueStr) return 'Preprint';
    
    // Remove year (4 digits at end or start)
    let s = venueStr.replace(/\d{4}/g, '').trim();
    let suffix = '';
    
    // Check if it is a conference that needs year suffix
    const conferences = ['NeurIPS', 'CVPR', 'ICCV', 'ECCV', 'ICRA', 'ICML', 'AAAI', 'GLOBECOM', 'INFOCOM', 'MOBICOM'];
    for (const conf of conferences) {
        if (s.includes(conf)) {
            // Get last two digits of year
            if (year) {
                const yearStr = year.toString();
                if (yearStr.length === 4) {
                    suffix = "'" + yearStr.substring(2);
                }
            }
            return conf + suffix;
        }
    }

    // Special cases
    if (s.toLowerCase().includes('arxiv')) return 'ArXiv'; // No year
    
    // Journals or specific conferences
    if (s.includes('TDSC')) return 'IEEE TDSC';
    if (s.includes('TMC')) return 'IEEE TMC';
    if (s.includes('JSAC')) return 'IEEE JSAC';
    if (s.includes('TGCN')) return 'IEEE TGCN';
    if (s.includes('LNET')) return 'IEEE LNET';
    if (s.includes('TPAMI')) return 'IEEE TPAMI';
    if (s.includes('TIP')) return 'IEEE TIP';
    if (s.includes('TCSVT')) return 'IEEE TCSVT';
    if (s.includes('TGRS')) return 'IEEE TGRS';
    if (s.includes('IJCV')) return 'IJCV';
    if (s.includes('PR')) return 'PR';
    if (s.includes('IOTJ') || s.includes('IoTJ')) return 'IEEE IoTJ';

    return s;
}

function getVenueFullName(venueStr, year) {
    if (!venueStr) return '';
    let s = venueStr.replace(/\d{4}/g, '').trim(); // Remove year
    
    // Get year suffix for conferences
    let yearSuffix = '';
    if (year) {
        const yearStr = year.toString();
        if (yearStr.length === 4) {
            yearSuffix = "'" + yearStr.substring(2);
        }
    }

    // Journal Full Names Mapping (No Year)
    if (s.includes('TPAMI')) return 'IEEE Transactions on Pattern Analysis and Machine Intelligence';
    if (s.includes('TIP')) return 'IEEE Transactions on Image Processing';
    if (s.includes('TMM')) return 'IEEE Transactions on Multimedia';
    if (s.includes('TGRS')) return 'IEEE Transactions on Geoscience and Remote Sensing';
    if (s.includes('TCSVT')) return 'IEEE Transactions on Circuits and Systems for Video Technology';
    if (s.includes('IJCV')) return 'International Journal of Computer Vision';
    if (s.includes('PR')) return 'Pattern Recognition';
    if (s.includes('TDSC')) return 'IEEE Transactions on Dependable and Secure Computing';
    if (s.includes('TMC')) return 'IEEE Transactions on Mobile Computing';
    if (s.includes('JSAC')) return 'IEEE Journal on Selected Areas in Communications';
    if (s.includes('TGCN')) return 'IEEE Transactions on Green Communications and Networking';
    if (s.includes('TNSE')) return 'IEEE Transactions on Network Science and Engineering';
    if (s.includes('IoTJ') || s.includes('IoTJ')) return 'IEEE Internet of Things Journal';
    if (s.includes('LNET') || s.includes('LNet')) return 'IEEE Networking Letters';
    
    // Conference Full Names Mapping (With Year Suffix)
    if (s.includes('NeurIPS')) return `Annual Conference on Neural Information Processing Systems (NeurIPS${yearSuffix})`;
    if (s.includes('CVPR')) return `IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR${yearSuffix})`;
    if (s.includes('ICCV')) return `IEEE/CVF International Conference on Computer Vision (ICCV${yearSuffix})`;
    if (s.includes('ECCV')) return `European Conference on Computer Vision (ECCV${yearSuffix})`;
    if (s.includes('ICML')) return `International Conference on Machine Learning (ICML${yearSuffix})`;
    if (s.includes('AAAI')) return `AAAI Conference on Artificial Intelligence (AAAI${yearSuffix})`;
    if (s.includes('ECCV')) return `European Conference on Computer Vision (ECCV{yearSuffix})`;
    if (s.includes('INFOCOM')) return `IEEE International Conference on Computer Communications (INFOCOM${yearSuffix})`;
    if (s.includes('MOBICOM')) return `Annual International Conference on Mobile Computing and Networking (MobiCom${yearSuffix})`;
    
    if (s.toLowerCase().includes('arxiv')) return 'arXiv preprint';
    
    return s;
}

function getCCFRank(fullName, originalVenue) {
    const v = (fullName + ' ' + originalVenue).toLowerCase();
    
    // CCF-A
    if (v.includes('tdsc') || v.includes('dependable and secure') || 
        v.includes('tmc') || v.includes('mobile computing') || 
        v.includes('aaai') || v.includes('neurips') || 
        v.includes('cvpr') || v.includes('iccv') || 
        v.includes('icml') || v.includes('ijcv') || 
        v.includes('tpami') || v.includes('tip') || 
        v.includes('infocom') || v.includes('jsac')) {
        return 'A';
    }
    
    // CCF-B
    if (v.includes('icra') || v.includes('eccv')) {
        return 'B';
    }
    
    // CCF-C
    if (v.includes('globecom')) {
        return 'C';
    }
    
    return null;
}

// Function to render news items
function renderNewsItems(newsData, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn('News container not found:', containerId);
        return;
    }
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Add each news item to the container
    newsData.forEach(newsItem => {
        const newsElement = document.createElement('div');
        newsElement.className = 'news-item';
        
        // Create the date element
        const dateElement = document.createElement('span');
        dateElement.className = 'news-date';
        dateElement.textContent = newsItem.date;
        
        // Create the content element
        const contentElement = document.createElement('div');
        contentElement.className = 'news-content';
        
        // Create emoji and content text
        const textSpan = document.createElement('span');
        textSpan.innerHTML = '🎉 ' + newsItem.content;
        contentElement.appendChild(textSpan);
        
        // Add links if provided in the links array format
        if (newsItem.links && newsItem.links.length > 0) {
            newsItem.links.forEach(link => {
                const space = document.createTextNode(' ');
                contentElement.appendChild(space);
                
                const linkElement = document.createElement('a');
                linkElement.href = link.url;
                linkElement.textContent = link.text;
                if (link.url && !link.url.startsWith('#')) {
                    linkElement.setAttribute('target', '_blank');
                }
                contentElement.appendChild(linkElement);
            });
        }
        
        // Check for old style link (backward compatibility)
        if (newsItem.link && newsItem.link !== '#' && (!newsItem.links || newsItem.links.length === 0)) {
            const space = document.createTextNode(' ');
            contentElement.appendChild(space);
            
            const linkElement = document.createElement('a');
            linkElement.href = newsItem.link;
            linkElement.textContent = '[Link]';
            linkElement.setAttribute('target', '_blank');
            contentElement.appendChild(linkElement);
        }
        
        newsElement.appendChild(dateElement);
        newsElement.appendChild(contentElement);
        container.appendChild(newsElement);
    });
}

// Function to render honors items
function renderHonorsItems(honorsData, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn('Honors container not found:', containerId);
        return;
    }
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Add each honor item to the container
    honorsData.forEach(honor => {
        const honorElement = document.createElement('div');
        honorElement.className = 'honor-item';
        
        // Year
        const yearElement = document.createElement('div');
        yearElement.className = 'honor-year';
        yearElement.textContent = honor.date;
        
        // Content
        const contentElement = document.createElement('div');
        contentElement.className = 'honor-content';
        
        const titleElement = document.createElement('h3');
        titleElement.textContent = honor.title;
        
        const orgElement = document.createElement('p');
        orgElement.className = 'text-sm text-neutral-600';
        orgElement.textContent = honor.org;
        
        contentElement.appendChild(titleElement);
        contentElement.appendChild(orgElement);
        
        honorElement.appendChild(yearElement);
        honorElement.appendChild(contentElement);
        
        container.appendChild(honorElement);
    });
}

// Helper to open all external links in new tab
function makeAllLinksOpenInNewTab() {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        if (link.hostname !== window.location.hostname && link.getAttribute('href') && !link.getAttribute('href').startsWith('#') && !link.getAttribute('href').startsWith('mailto:')) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
}

// Helper to setup MutationObserver for dynamically added links
function setupLinkObserver() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        if (node.tagName === 'A') {
                            if (node.hostname !== window.location.hostname && node.getAttribute('href') && !node.getAttribute('href').startsWith('#') && !node.getAttribute('href').startsWith('mailto:')) {
                                node.setAttribute('target', '_blank');
                                node.setAttribute('rel', 'noopener noreferrer');
                            }
                        }
                        // Check descendants
                        const links = node.querySelectorAll('a');
                        links.forEach(link => {
                            if (link.hostname !== window.location.hostname && link.getAttribute('href') && !link.getAttribute('href').startsWith('#') && !link.getAttribute('href').startsWith('mailto:')) {
                                link.setAttribute('target', '_blank');
                                link.setAttribute('rel', 'noopener noreferrer');
                            }
                        });
                    }
                });
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
