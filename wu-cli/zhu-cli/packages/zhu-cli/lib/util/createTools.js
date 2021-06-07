


function getPromptModules(){
    return ['vueVersion'].map(file=>require(`../promptModules/${file}`));
}
exports.getPromptModules = getPromptModules;