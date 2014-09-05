
var localRepo = {
  'dummy' : {
    path : 'C:/Users/ArifSetiawan/Repository/Simaya/dummyd',
    branch : ['master', 'test']
  }
}

var deployRepo = {
  'simaya' : {
    path : '/home/simaya/apps/simaya',
    branch : ['master']
  }
}

var result = function(status, message, data) {
  return {
    meta: {
      status: status,
      message: message
    },
    data: data ? data : null
  }
}

module.exports = {
  port : process.env.PORT ? process.env.PORT : 3001,
  result : result,
  repo : process.env.PORT ? deployRepo : localRepo
}