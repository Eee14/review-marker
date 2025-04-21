//Ctrl 鍵標記或取消標記
document.addEventListener("keydown", (鍵) => {
  if (鍵.key === "Control" && !鍵.repeat) { //「!鍵.repeat」確保長按 Ctrl 時只觸發一次，防止標點急速新增、刪除
    const 影音 = document.querySelector("video, audio");
    if (!影音) return;

    const 時刻 = 影音.currentTime;
    const 容 = 取() || 建();//取得現有的標點容器，若沒有就建立一個。
    const 已標 = Array.from(容.children).find(標 => Math.abs(parseFloat(標.dataset.time) - 時刻) < 0.1);//檢查是否存在接近該時刻的標點

    //若標點存在：移除    //若標點不存在：新增
    已標 ? 已標.remove() : 標記(影音, 時刻);
  }
});

//按下標點，跳至對應時間點（事件委派）
document.addEventListener("click", (按) => {
  const 標 = 按.target.closest(".review-mark");
  const 時刻 = parseFloat(標.dataset.time);
  const 影音 = document.querySelector("video, audio");
  if (影音) 影音.currentTime = 時刻;
});

//新增標點（「標記」爲動詞）
function 標記(影音, 時刻) {
  const 容 = 取() || 建();
  const 度 = (時刻 / 影音.duration) * 100;

  //建立標點
  const 標 = document.createElement("div");
  標.className    = "review-mark";
  標.style.left   = `${度}%`;
  標.dataset.time = 時刻; //將時間資訊直接存進標點
  標.title        = 格(時刻);

  容.appendChild(標);
  遷();
}

//排列標點，避免重疊
function 排() {
  const 點 = document.querySelectorAll(".review-mark"); //取得所有 .review-mark
  const 高 = 11;  //標點列行高
  const 寬 = 11;  //標點最小間距
  const 陣 = [[]];//排列標點用的陣列
  const 理 = Array.from(點).sort((甲, 乙) => parseFloat(甲.dataset.time) - parseFloat(乙.dataset.time));//依時間排列標點

  理.forEach(標 => {
    let 置 = false;
    for (let 行 of 陣) {
      //若行內沒有標點，或標點與前一個標點的距離大於「寬」，則放入此行
      if (行.length === 0 || 標.offsetLeft - 行[行.length - 1].offsetLeft > 寬) {
        行.push(標);
        置 = true;
        break;
      }
    }
    if (!置) 陣.push([標]); //若無法放入現有行，則新增一行
  });

  //依照行數調整標點的垂直位置
  陣.forEach((行, 行數) => {
    行.forEach(標 => {
      標.style.top = `${行數 * 高}px`;
    });
  });
}

//更新標點容器位置
function 遷() {
  const 影音 = document.querySelector("video, audio");
  if (!影音) return;

  const 容 = 取();
  const 墊 = 影音.getBoundingClientRect();
  if (容) {
    容.style.position = "absolute";
    容.style.width    = `${墊.width                  }px`;
    容.style.left     = `${墊.left   + window.scrollX}px`;
    容.style.top      = `${墊.bottom + window.scrollY}px`;
  }

  排(); //確保標點正確排列
}

//取得容器
function 取() {
  return document.querySelector(".review-mark-container");
}

//建立容器
function 建() {
  const 容 = document.createElement("div"); //建立標點容器（div 元素）
  容.className = "review-mark-container";   //賦予標點容器 .review-mark-container 的 CSS 類別（讓他能透過 CSS 設計樣式）
  document.body.appendChild(容);            //將標點容器加入 document.body（讓他存在於頁面中）
  return 容;
}

//格式化時間
function 格(秒數) {
  const 時 = Math.floor( 秒數 / 3600);
  const 分 = Math.floor((秒數 % 3600) / 60);
  const 秒 = Math.floor( 秒數 % 60);
  return 時 > 0
    ? `${時}:${分.toString().padStart(2, "0")}:${秒.toString().padStart(2, "0")}`
    : `${分}:${秒.toString().padStart(2, "0")}`;
}

//滾動頁面、視窗變動時，重新定位容器
window.addEventListener("scroll", 遷);
window.addEventListener("resize", 遷);

//樣式
const 樣 = document.createElement("style");
樣.textContent = `
  .review-mark-container {
    height: auto;
    display: flex;
    flex-direction: column;
  }
  .review-mark {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: forestgreen;
    border-radius: 50%;
    transform: translateX(-50%);
    cursor: pointer;
    pointer-events: all;
    z-index: 2029;/*經實測，數值達到 2030，標點會蓋過 Youtube 的漢堡選單，這是目前不影響漢堡選單使用體驗的極限。*/
    transition: transform 0.05s ease-in-out;
  }
  .review-mark:hover {
    transform: translateX(-50%) scale(1.618);
    background-color: mediumseagreen;
  }
  .review-mark:active {
    background-color: seagreen;
  }
`;
document.head.appendChild(樣);

//接收 popup.js 傳送的「清除標點」指令
browser.runtime.onMessage.addListener((訊) => {
  if (訊.action === "清") {
    const 容 = 取();
    if (容) 容.innerHTML = "";
  }
});