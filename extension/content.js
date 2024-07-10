let editBtnSelector = [
  "#settings-body > div > div.Polaris-Box > div.Polaris-Page-Header--mediumTitle > div > div.Polaris-Page-Header__RightAlign > div.Polaris-Page-Header__PrimaryActionWrapper > div > button",
  "#settings-body > div > div.Polaris-Box > div:nth-child(2) > div > div.Polaris-Page-Header__RightAlign > div.Polaris-Page-Header__PrimaryActionWrapper > div > button",
  "#settings-body > div > div.Polaris-Box > div.Polaris-Page-Header--mediumTitle > div > div.Polaris-Page-Header__RightAlign > div.Polaris-Page-Header__PrimaryActionWrapper > div > button"
]


let htmlTemplateLinesSelector ="div.cm-content.cm-lineWrapping > div.cm-line"

let htmlTemplateScrollerSelector = "#settings-body > div > div:nth-child(2) > div > div > form > div > div:nth-child(2) > div > div > div:nth-child(1) > div > div > div:nth-child(4) > div > div > div > div.cm-scroller"

let previewBtnSelector = "#settings-body > div > div.Polaris-Box > div.Polaris-Page-Header--mediumTitle > div > div.Polaris-Page-Header__RightAlign > div > div > div.Polaris-ActionMenu-Actions__ActionsLayout > div:nth-child(2) > button"

let saveChangesSelector = "#center-slot > div > div > div > div > div > div._ButtonContainer_1nw3y_42 > span > button"

let generalNotificationsSelector = [
  "#settings-body > div > div.Polaris-Box > div.Polaris-Page-Header--mediumTitle > div > div.Polaris-Page-Header__BreadcrumbWrapper > div > a","#settings-body > div > div.Polaris-Box > div.Polaris-Page-Header--longTitle > div > div.Polaris-Page-Header__BreadcrumbWrapper > div > a"
]

let customerNotificationsSelector = [
  "#settings-body > div > div.Polaris-Box > div.Polaris-Page-Header--mediumTitle > div > div.Polaris-Page-Header__BreadcrumbWrapper > div > a",
  "#settings-body > div > div.Polaris-Box > div:nth-child(2) > div > div.Polaris-Page-Header__BreadcrumbWrapper > div > a"
]

async function setStorageItem(key, value) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [key]: value }, function() {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

async function getStorageItem(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], function(result) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key] !== undefined ? result[key] : null);
      }
    });
  });
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function containsSubstrings(text, substrings) {
  return substrings.some(substring => text.includes(substring));
}

async function scrollAndEditElements(scroller,myInput) {

  let {
    // remove any that will lead back to the shopify store
    removeSources,
    showContactEmail,
    storeURL,
    storeURLText,
    forgotPassURL,
    accountURL
  } = myInput

  let scrollCounter = 0
  while (scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight-3) {
    let elements = Array.from(document.querySelectorAll(htmlTemplateLinesSelector));
    elements.forEach((el) =>{

      if(removeSources){
        // check line 167

        el.innerHTML = el.innerHTML.replace("View your order","")
        el.innerHTML = el.innerHTML.replace("View payment information","")
        el.innerHTML = el.innerHTML.replace("Confirm order","")
        el.innerHTML = el.innerHTML.replace("Visit online store",storeURLText)
        el.innerHTML = el.innerHTML.replace("Items in your cart","")
        el.innerHTML = el.innerHTML.replace(/{{\s*order_status_url\s*}}/g, "");
        el.innerHTML = el.innerHTML.replace("Return to cart","")
        el.innerHTML = el.innerHTML.replace("Continue to checkiyt","")
        if (/Come back or visit/.test(el.innerText)) {
          console.log(el.innerHTML)
          el.innerHTML = el.innerHTML.replace("or", "");
          el.innerHTML = el.innerHTML.replace("Come back or visit","")
          el.innerHTML = el.innerHTML.replace("our online store","")
        }
        el.innerHTML = el.innerHTML.replace(/{{\s*customer.reset_password_url\s*}}/,forgotPassURL)
        el.innerHTML = el.innerHTML.replace(/{{\s*account_link\s*}}/,accountURL)
        el.innerHTML = el.innerHTML.replace(/{{\s*email_confirmation_url\s*}}/g, "");

      }
      if(storeURL){

        el.innerHTML = el.innerHTML.replace(/{{\s*shop\.url\s*}}/g, storeURL);
        // TODO gift card url
        el.innerHTML = el.innerHTML.replace(/{{\s*gift_card\.url\s*}}/g, storeURL);

        el.innerHTML = el.innerHTML.replace(/{{\s*checkout_payment_collection_url\s*}}/g, storeURL);
        el.innerHTML = el.innerHTML.replace(/{{\s*unsubscribe_url\s*}}/g, storeURL);
        el.innerHTML = el.innerHTML.replace(/{{\s*invoice_url\s*}}/g, storeURL);
        el.innerHTML = el.innerHTML.replace(/{{\s*checkout_url\s*}}/g, storeURL);
        // keep this one
        // el.innerHTML = el.innerHTML.replace(/{{\s*order_status_url\s*}}/g, storeURL);


      }
      if(storeURLText){
        el.innerHTML = el.innerHTML.replace("Visit our store", storeURLText);
        if (/<td class="link__cell">or <a/.test(el.innerText)) {
          el.innerHTML = el.innerHTML.replace("or", "");
        }
      }

      if(!showContactEmail){
        el.innerHTML = el.innerHTML.replace(/{{\s*shop\.email\s*}}/g, "");
        el.innerHTML = el.innerHTML.replace("or contact us at", "");
        el.innerHTML = el.innerHTML.replace("Let us know", "Reply to this email");
      }
    });

    scroller.scrollTop = 0
    await sleep(1);
    scroller.scrollTop += Math.ceil(scroller.clientHeight/2) * scrollCounter;
    scrollCounter+=1

    await sleep(100); // Adjust sleep time based on the rendering speed
  }
  scroller.scrollTop = 0
}

async function bulkConvertAllEmails(myInput) {
  let emailTemplates = Array.from(document.querySelectorAll("._SettingsItem__clickableAction_ihwpi_123"));
  if(myInput.myIndex > emailTemplates.length){
    await setStorageItem("jobIsRunning","FALSE")
  }
  // hold on to this one day the page may not be forced to reload anymore
  (async () => {
    for (let i = 0; i < emailTemplates.length; i++) {
      if(i === myInput.myIndex){

        let x = emailTemplates[i];
        x.click();
        await sleep(4000);

        editBtnSelector.forEach((y,j)=>{

          let editBtn = document.querySelector(y);
          if(editBtn !==null){
            editBtn.click();
          }
        })
        await sleep(3000);

        await convertEmailTemplate(myInput, false);

        try {
          let saveChanges = document.querySelector(saveChangesSelector);
          saveChanges.click();
        } catch (error) {
        }
        await sleep(4000);

        generalNotificationsSelector.forEach((y,j)=>{

          let generalNotifications = document.querySelector(y);
          if(generalNotifications !==null){
            generalNotifications.click();
          }
        })
        await sleep(3000);

        customerNotificationsSelector.forEach((y,j)=>{

          let customerNotifications = document.querySelector(y);
          if(customerNotifications !==null){
            customerNotifications.click();
          }
        })

        myInput.myIndex+=1
        await setStorageItem("values",myInput)
        await sleep(1000);
        window.location.reload()
      }
    }
  })();


}

async function convertEmailTemplate(myInput,showPreview=true) {

  let htmlTemplateScroller  = document.querySelector(htmlTemplateScrollerSelector)
  await scrollAndEditElements(htmlTemplateScroller,myInput)
  if(showPreview){
    let previewBtn = document.querySelector(previewBtnSelector)
    previewBtn.click()
  }

}

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {

  if(request.msg.type === "StartJob"){
    bulkConvertAllEmails(request.msg.value)
    await setStorageItem("jobIsRunning","TRUE")
  }
  else if(request.msg.type === "UpdateThisTemplate"){
    convertEmailTemplate(request.msg.value)
  }
  else if(request.msg.type === "StopJob"){
    await setStorageItem("jobIsRunning","FALSE")
  }
});

getStorageItem("jobIsRunning")
.then((jobIsRunning)=>{
  if(jobIsRunning ==="TRUE" ){
    getStorageItem("values")
    .then(async (value)=>{
      await sleep(5000)
      bulkConvertAllEmails(value)
    })

  }

})
.catch(console.error)

