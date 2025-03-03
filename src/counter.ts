export function setupCounter(element: HTMLElement) {
    element.addEventListener("click", () => {
        document.querySelector<HTMLTextAreaElement>("#output")!.value = generateSelector();
    });
}

function generateSelector(): string {
    let returnText = "";
    let processingText = document.querySelector<HTMLTextAreaElement>("#input")!.value;
    processingText = processingText.replace(/<.*?>/g, "");
    const prefCityData: { pref: string; cities: string }[] = [];
    for (const elem of processingText.split("\n")) {
        if (elem.startsWith("-")) {
            prefCityData.push({ pref: elem.slice(1).trim(), cities: "" });
        } else if (elem.trim() !== "" && prefCityData.length !== 0) {
            prefCityData.at(-1)!.cities += elem + "\n";
        }
    }

    const returnData: string[] = [];
    for (const elem of prefCityData) {
        returnData.push(generateSelectorPref(elem));
    }
    return `${returnData.join(" OR ")}`;
}

function generateSelectorPref(prefdata: { pref: string; cities: string }): string {
    let processingText = prefdata.cities;
    let specialCityName = "";
    let returnText = "";
    for (const elem of processingText.split("\n")) {
        let processElem = elem.trim();
        if (processElem === "") continue;
        if (processElem.includes("(")) {
            const smallArea = processElem.match(/\(.*\)/)![0].slice(1,-1)
            processElem = processElem.replace(`(${smallArea})`,"")
            if (processElem.endsWith("町") || processElem.endsWith("村")) {
                processElem = processElem.replace(/^.*?郡|^.*?支庁/, "");
                returnText += `("CITY_NAME" = '${processElem}' AND (${generateSelectorSmallArea(smallArea)})) OR `;
                specialCityName = "";
            } else if (processElem.endsWith("市")) {
                returnText += `("CITY_NAME" LIKE '${processElem}%' AND (${generateSelectorSmallArea(smallArea)})) OR `;
                specialCityName = "";
            } else if (processElem.endsWith("区")) {
                if(processElem.includes("市")){
                    specialCityName = processElem.match(/^.*?市/)![0];
                    returnText += `("CITY_NAME" LIKE '${processElem}%' AND (${generateSelectorSmallArea(smallArea)})) OR `;
                }else if (specialCityName) {
                    returnText += `("CITY_NAME" LIKE '${specialCityName}${processElem}%' AND (${generateSelectorSmallArea(smallArea)})) OR `;
                } else {
                    returnText += `("CITY_NAME" LIKE '${processElem}%' AND (${generateSelectorSmallArea(smallArea)})) OR `;
                }
            }
        } else {
            if (processElem.endsWith("町") || processElem.endsWith("村")) {
                processElem = processElem.replace(/^.*?郡|^.*?支庁/, "");
                for (const cityName of processElem.split("・")) {
                    returnText += `"CITY_NAME" = '${cityName}' OR `;
                }
                specialCityName = "";
            } else if (processElem.endsWith("市")) {
                for (const cityName of processElem.split("・")) {
                    returnText += `"CITY_NAME" LIKE '${cityName}%' OR `;
                }
                specialCityName = "";
            } else if (processElem.endsWith("区")) {
                if (processElem.includes("市")) {
                    specialCityName = processElem.match(/^.*?市/)![0];
                    processElem = processElem.replace(specialCityName, "");
                    for (const cityName of processElem.split("・")) {
                        returnText += `"CITY_NAME" LIKE '${specialCityName}${cityName}%' OR `;
                    }
                } else {
                    for (const cityName of processElem.split("・")) {
                        returnText += `"CITY_NAME" LIKE '${cityName}%' OR `;
                    }
                    specialCityName = "";
                }
            }
        }
    }
    if (returnText) {
        return `("PREF_NAME" = '${prefdata.pref}' AND (${returnText.slice(0, -4)}))`;
    } else {
        return `(1 = 1)`;
    }
}

let processingText = ""
function generateSelectorSmallArea(selector: string, prefix = ""): string{
    processingText = selector;
    let returnText = ""
    let smallAreaName = ""
    let isIncluding = true;
    let isAboveCorrect = false;
    let isPopulation = false;

    function smallAreaSelector(){
        if(isPopulation){
            return `"JINKO" = ${smallAreaName.slice(2)}`
        }else if(smallAreaName === "NULL"){
            return `"S_NAME" IS NULL`
        }else{
            return `"S_NAME" LIKE '${prefix}${smallAreaName}${isAboveCorrect ? "" : "%"}'`
        }
    }
    while(processingText.length !== 0){
        const beforeProcessedText = processingText;
        processingText = processingText.slice(1)
        if(beforeProcessedText.startsWith("]")) break;
        if(beforeProcessedText.startsWith("を除く")){
            isIncluding = false;
            processingText = processingText.slice(2)
            continue
        }
        if(beforeProcessedText.startsWith("[")){
            returnText += `(${smallAreaSelector()} AND (${generateSelectorSmallArea(processingText,smallAreaName)})) OR `
            smallAreaName = "";
            isAboveCorrect = false;
            continue;
        }
        if(beforeProcessedText.startsWith("$")){
            isAboveCorrect = true;
            continue;
        }
        if(beforeProcessedText.startsWith("人") && smallAreaName.startsWith("人口")){
            isPopulation = true;
            continue;
        }
        if(beforeProcessedText.startsWith("・") || beforeProcessedText.startsWith("、") || beforeProcessedText.startsWith(",")){
            if(smallAreaName) returnText += `(${smallAreaSelector()}) OR `;
            smallAreaName = "";
            isAboveCorrect = false;
            isPopulation = false;
            continue
        }

        smallAreaName += beforeProcessedText.slice(0,1)
    }
    if(smallAreaName){
        if(smallAreaName) returnText += `(${smallAreaSelector()}) OR `;
    }
    if (returnText) {
        if(isIncluding) return returnText.slice(0, -4);
        else return `NOT (${returnText.slice(0, -4)})`
        
    } else {
        return `1 = 1`;
    }
}