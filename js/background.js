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

chrome.runtime.onMessage.addListener((message, sender) => {

    if (message.action === 'resizeShade') {

        syncSetStore({
            width: message.width,
            height: message.height
        })
    }

    if (message.action === 'moveShade') {

        syncSetStore({
            top: message.top,
            left: message.left
        })
        
    }

});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

    if (!(changeInfo.status === 'complete' && tab.active)) {
        return;
    }

    chrome.storage.sync.get(null, (Store) => {

        const url = tab.url;

        if (!(Store[url] && Store[url]['enable'])) {
            return;
        }

        const cssUpdate = {
            
            action: 'updateShadeCSS',
            shadeLvl: (Store[url]['shadeLvl'] / 100),
            width: Store[url]['width'],
            height: Store[url]['height'],
            top: Store[url]['top'],
            left: Store[url]['left']

        }

        chrome.tabs.sendMessage(tabId, {
            action: 'enableApp'
        });

        chrome.tabs.insertCSS(tabId, {
            file: './css/enableApp.css'
        });

        chrome.tabs.sendMessage(tabId, cssUpdate);

    });

});