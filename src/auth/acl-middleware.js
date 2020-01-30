'use strict';

/** 
 * @module aclMiddleware
*/
module.exports = (capabilities) => {
  return (req, res, next) => {
    try {
      if(req.user.capabilities.includes(capabilities)){
        next();
      }
      else{
        next('access denied');
      }
    }
    catch(error){
      next('invalid login');
    }
  };
};