const getCurrentTabUrl = () => {

    const promise = new Promise((resolve, reject) => {

        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => {

            resolve(tabs[0]);

        });

    });

    return promise;

}

const getStore = (currentTab) => {


    const promise = new Promise((resolve, reject) => {

        chrome.storage.sync.get(null, Store => {

            resolve({
                currentTab: currentTab,
                Store: Store
            });

        });

    });

    return promise;

}


const checkEnable = () => {

    const promise = new Promise((resolve, reject) => {

        const checkEnableCB = (data) => {

            const url = data.currentTab.url;
            const id = data.currentTab.id;
            const Store = data.Store;
            const onOFFInput = document.getElementById('onOFF');

            if (Store[url] === undefined) {

                let items = {};

                items[url] = {

                    enable: true,
                    shadeLvl: 90

                };

                chrome.tabs.sendMessage(id, {
                    action: 'enableApp'
                });

                chrome.tabs.insertCSS(id, {
                    file: './css/enableApp.css'
                });

                onOFFInput.checked = true;

                chrome.storage.sync.set(items, () => {
                    resolve();
                });

                return;

            }

            if (Store[url]['enable'] === true) {

                const cssUpdate = {

                    action: 'updateShadeCSS',
                    shadeLvl: (Store[url]['shadeLvl'] / 100),
                    width: Store[url]['width'],
                    height: Store[url]['height'],
                    top: Store[url]['top'],
                    left: Store[url]['left']

                }

                chrome.tabs.sendMessage(id, {
                    action: 'enableApp'
                });

                chrome.tabs.insertCSS(id, {
                    file: './css/enableApp.css'
                });

                chrome.tabs.sendMessage(id, cssUpdate);

                onOFFInput.checked = true;

            } else {

                chrome.tabs.executeScript(id, {
                    code: 'document.getElementById("AddonPrivacyShade").remove();'
                });

                onOFFInput.checked = false;
            }

            resolve();

        }

        getCurrentTabUrl()
            .then(getStore)
            .then(checkEnableCB);
    });

    return promise;
}

const syncSetStore = (items) => {

    const promise = new Promise((resolve, reject) => {

        getCurrentTabUrl()
            .then(getStore)
            .then(
                (data) => {

                    const Store = data.Store;
                    const url = data.currentTab.url;
                    const updateStoreUrl = { ...Store[url],
                        ...items
                    };

                    let updatedStore = {};

                    updatedStore[url] = updateStoreUrl;

                    chrome.storage.sync.set(updatedStore, () => {
                        resolve();
                    });

                }
            );

    })

    return promise;
};

const MAIN = (data) => {

    const onOFFInput = document.getElementById('onOFF');
    const shadeLevel = document.getElementById('shadeLevel');
    const Store = data.Store;
    const url = data.currentTab.url;


    Store[url] && Store[url]['shadeLvl'] ? shadeLevel.value = Store[url]['shadeLvl'] : shadeLevel.value = 90;

    checkEnable();

    onOFFInput.addEventListener('change', () => {

        const valOfTrue = onOFFInput.checked;
        const items = {
            enable: valOfTrue
        };

        syncSetStore(items).then(checkEnable);

    });

    shadeLevel.addEventListener('change', () => {

        const newShadeLvl = shadeLevel.value;
        const items = {
            shadeLvl: newShadeLvl
        };

        syncSetStore(items)
            .then(getCurrentTabUrl)
            .then((currentTab) => {

                const cssShadeLvl = newShadeLvl / 100;
                const changeShadeCmd = 'document.getElementById("AddonPrivacyShade").style.boxShadow = "0 0 0 999999px rgba(0, 0, 0,  ' + cssShadeLvl + ')";';

                chrome.tabs.executeScript(currentTab.id, {
                    code: changeShadeCmd
                });


            });

    });

}

document.addEventListener('DOMContentLoaded', () => {

    getCurrentTabUrl()
        .then(getStore)
        .then(MAIN);

});