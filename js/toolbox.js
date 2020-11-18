function buildFromModel(obj, model, data){
  for(const key in model) {
    if(key in data){
      obj[key] = data[key];
    }
    else {
      obj[key] = model[key]
    }
  }
}

export {
  buildFromModel
}
