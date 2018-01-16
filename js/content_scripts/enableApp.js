chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if ((message.action !== "enableApp") || (document.getElementById('AddonPrivacyShade'))) {
        return;
    }

    let rootHTML = document.createElement("div");

    rootHTML.id = 'AddonPrivacyShade';
    document.body.appendChild(rootHTML);

    let rootHTMLQ = document.getElementById('AddonPrivacyShade');

    rootHTMLQ.innerHTML = '<div id="headerShade"><p id="moveSignShade" unselectable="on"><span class="upDown">&harr;</span><span class="leftRight">&varr;</span></p></div><div id="resizerShade"><p id="resizeDesc">&#8597;</p></div>';

    const dragElement = (element) => {

        let pos1 = 0;
        let pos2 = 0;
        let pos3 = 0;
        let pos4 = 0;
        let top = 0;
        let left = 0;

        const dragMouseDown = (event) => {

            event = event || window.event;

            pos3 = event.clientX;
            pos4 = event.clientY;

            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;

        }

        const elementDrag = (event) => {

            event = event || window.event;
            
            pos1 = pos3 - event.clientX;
            pos2 = pos4 - event.clientY;
            pos3 = event.clientX;
            pos4 = event.clientY;

            top = rootHTMLQ.offsetTop - pos2;
            left = rootHTMLQ.offsetLeft - pos1;

            rootHTMLQ.style.top = top + "px";
            rootHTMLQ.style.left = left + "px";
        }

        const closeDragElement = () => {

            document.onmouseup = null;
            document.onmousemove = null;

            chrome.runtime.sendMessage({
                action: 'moveShade',
                top: top,
                left: left
            });

        }

        element.onmousedown = dragMouseDown;
    }

    const initResize = (event) => {

        let initX = 0;
        let initY = 0;
        let initWidth = 0;
        let initHeight = 0;
        let newWidth = 0;
        let newHeight = 0;

        const doResize = (event) => {

            newWidth = initWidth + event.clientX - initX;
            newHeight = initHeight + event.clientY - initY;

            rootHTMLQ.style.width = newWidth + 'px';
            rootHTMLQ.style.height = newHeight + 'px';

        }

        const stopResize = (event) => {

            document.documentElement.removeEventListener('mousemove', doResize, false);
            document.documentElement.removeEventListener('mouseup', stopResize, false);

            chrome.runtime.sendMessage({
                action: 'resizeShade',
                width: newWidth,
                height: newHeight
            });

        }

        initX = event.clientX;
        initY = event.clientY;

        initWidth = parseInt(document.defaultView.getComputedStyle(rootHTMLQ).width, 10);
        initHeight = parseInt(document.defaultView.getComputedStyle(rootHTMLQ).height, 10);

        document.documentElement.addEventListener('mousemove', doResize, false);
        document.documentElement.addEventListener('mouseup', stopResize, false);

    }

    document.getElementById('resizerShade').addEventListener('mousedown', initResize);

    dragElement(document.getElementById("headerShade"));

})