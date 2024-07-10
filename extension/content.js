let editBtnSelector = "#settings-body > div > div.Polaris-Box > div.Polaris-Page-Header--mediumTitle > div > div.Polaris-Page-Header__RightAlign > div.Polaris-Page-Header__PrimaryActionWrapper > div > button"


let htmlTemplateLinesSelector ="div.cm-content.cm-lineWrapping > div.cm-line"

let htmlTemplateScrollerSelector = "#settings-body > div > div:nth-child(2) > div > div > form > div > div:nth-child(2) > div > div > div:nth-child(1) > div > div > div:nth-child(4) > div > div > div > div.cm-scroller"

let previewBtnSelector = "#settings-body > div > div.Polaris-Box > div.Polaris-Page-Header--mediumTitle > div > div.Polaris-Page-Header__RightAlign > div > div > div.Polaris-ActionMenu-Actions__ActionsLayout > div:nth-child(2) > button"


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function containsSubstrings(text, substrings) {
  return substrings.some(substring => text.includes(substring));
}

async function scrollAndEditElements(scroller,myInput) {
  let capturedElements =[]
  let {
    // remove any that will lead back to the shopify store
    removeSources,
    showContactEmail,
    storeURL,
    storeURLText
  } = myInput

  let scrollCounter = 0
  while (scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight-1) {
    let elements = Array.from(document.querySelectorAll(htmlTemplateLinesSelector));
    elements.forEach((el) =>{

      if(removeSources){
        // check line 167

        el.innerHTML = el.innerHTML.replace("View your order","")
        el.innerHTML = el.innerHTML.replace(/{{\s*order_status_url\s*}}/g, "");
      }
      if(storeURL){
        el.innerHTML = el.innerHTML.replace(/{{\s*shop\.url\s*}}/g, storeURL);
      }
      if(storeURLText){
        el.innerHTML = el.innerHTML.replace("Visit our store", storeURLText);
        if (/<td class="link__cell">or <a/.test(el.innerText)) {
          el.innerHTML = el.innerHTML.replace("or", "");
        }
      }
    });

    scroller.scrollTop = 0
    scroller.scrollTop += Math.ceil(scroller.clientHeight/2) * scrollCounter;
    scrollCounter+=1

    await sleep(150); // Adjust sleep time based on the rendering speed
  }
  return Array.from(capturedElements);
}

async function bulkConvertAllEmails(myInput) {

  let emailTemplates = Array.from(document.querySelectorAll("._SettingsItem__clickableAction_ihwpi_123"))

  emailTemplates.forEach(async (x,i)=>{
    if(i ===0){
      x.click()
      await sleep(2000)
      let editBtn = document.querySelector(editBtnSelector)
      editBtn.click()
      await sleep(3000);
      await convertEmailTemplate(myInput)


    }
  })

}

async function convertEmailTemplate(myInput) {

  let htmlTemplateScroller  = document.querySelector(htmlTemplateScrollerSelector)
  await scrollAndEditElements(htmlTemplateScroller,myInput)
  let previewBtn = document.querySelector(previewBtnSelector)
  previewBtn.click()

}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

  if(request.msg.type === "StartJob"){
    bulkConvertAllEmails(request.msg.value)
  }
  else if(request.msg.type === "UpdateThisTemplate"){
    convertEmailTemplate(request.msg.value)
  }
});


