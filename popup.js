document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("號").textContent = `v${browser.runtime.getManifest().version}`;
  //讀取 manifest.json 的 version 並塞進 popup.html 中顯示版本號的區塊

  const 清 = document.querySelector(".清"); //清除鈕
  清.addEventListener("click", () => {      //被按下
    //傳送訊息給 content.js，指示清除標點
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      browser.tabs.sendMessage(tabs[0].id, { action: "清" });
    });
  });
});
