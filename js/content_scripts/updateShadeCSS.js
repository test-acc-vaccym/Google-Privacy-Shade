chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action !== "updateShadeCSS") {
        return;
    }

    let shade = document.getElementById("AddonPrivacyShade");
    shade.style.boxShadow = '0 0 0 999999px rgba(0, 0, 0, ' + message.shadeLvl + ')';
    shade.style.width = message.width + 'px';
    shade.style.height = message.height + 'px';
    shade.style.top = message.top + 'px';
    shade.style.left = message.left + 'px';

});