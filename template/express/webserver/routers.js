/*!
 * 路由
 * @author ydr.me
 * @create 2015-04-29 14:32
 */


'use strict';

var express = require('express');
var configs = require('../configs.js');
var path = require('path');
var multer = require('multer');

var uploadParser = multer({dest: path.join(configs.webroot, '.upload')});
// 更为详尽配置的静态服务器
var staticOptions = {
    dotfiles: 'ignore',
    etag: true,
    extensions: ['html'],
    index: false,
    maxAge: '30d',
    redirect: true
};

module.exports = function (next, app) {
    var controllers = require('./controllers/');

    app.use(controllers.middleware.strictRouting);
    app.use(controllers.middleware.parseUA);
    app.use(controllers.middleware.readCache);
    app.use(controllers.middleware.checkLvguanjiaUser);
    app.use(controllers.middleware.checkLvguanjiaClub);
    app.use(controllers.middleware.checkLogin);

    //desktop页面配置
    app.get('/', controllers.desktop.main.getIndex);
    app.get('/user/register/', controllers.desktop.user.getRegister);
    app.get('/user/apply/', controllers.desktop.user.getApply);
    app.get('/user/apply/success/', controllers.desktop.user.getApplySuccess);
    app.get('/user/bind/', controllers.desktop.user.getBind);
    app.get('/user/password/', controllers.desktop.user.getPassword);
    app.get('/user/auth/', controllers.desktop.user.getAuth);
    app.get('/user/auth/callback/:authType/', controllers.desktop.user.getAuthCallback);
    app.get('/user/erp/', controllers.desktop.user.getErp);
    app.get('/user/bbs/', controllers.desktop.user.getBBS);

    app.get('/help/agreement/', controllers.desktop.help.getAgreement);
    // 兼容旧版本
    app.get('/aboutus/', controllers.desktop.help.getAboutUs301);
    app.get('/help/about-us/', controllers.desktop.help.getAboutUs);


    //mobile页面配置
    app.get('/m/', controllers.mobile.main.getMobileIndex);
    app.get('/m/user/register/', controllers.mobile.user.getRegister);
    app.get('/m/user/login/', controllers.mobile.user.getLogin);
    app.get('/m/user/apply/', controllers.mobile.user.getApply);
    app.get('/m/user/apply/success/', controllers.mobile.user.getApplySuccess);
    app.get('/m/user/apply/list/', controllers.mobile.user.getApplyList);
    app.get('/m/user/bind/', controllers.mobile.user.getBind);
    app.get('/m/user/password/', controllers.mobile.user.getPassword);

    app.get('/m/help/agreement/', controllers.mobile.help.getAgreement);
    app.get('/m/aboutus/', controllers.mobile.help.getAboutUs301);
    app.get('/m/help/about-us/', controllers.mobile.help.getAboutUs);


    // erp 页面路由
    app.all(/^\/erp\/.*$/, controllers.erp.middleware.getCurrentUser);
    app.all(/^\/erp\/.*$/, controllers.erp.middleware.getCurrentClub);
    app.all(/^\/erp\/account\/.*$/, controllers.erp.middleware.getCashAccount);
    app.get('/erp/account/', controllers.erp.account.getIndex);
    app.get('/erp/account/apply-cash/', controllers.erp.account.getApplyCash);
    app.get('/erp/account/set-cash-password/', controllers.erp.account.getSetCashPassword);
    app.get('/erp/account/change-cash-password/', controllers.erp.account.getChangeCashPassword);
    app.get('/erp/account/forgot-cash-password/', controllers.erp.account.getForgotCashPassword);
    app.get('/erp/account/bind-cash-pay/', controllers.erp.account.getBindCashPay);
    app.get('/erp/account/bind-cash-pay-callback/', controllers.erp.account.getBindCashPayCallback);
    app.get('/erp/account/cashes/', controllers.erp.account.getCashes);

    app.get('/erp/activity2/', controllers.erp.activity.getIndex);
    app.get('/erp/activity2/refund-handle/', controllers.erp.activity.getRefundHandle);
    app.get('/erp/activity2/refund-list/', controllers.erp.activity.getRefundList);
    app.get('/erp/activity2/refund-confirm/', controllers.erp.activity.getRefundConfirm);
    app.get('/erp/activity2/refund-complete/', controllers.erp.activity.getRefundComplete);
    app.get('/erp/activity2/activityPub/', controllers.erp.activity.getPublish);

    // 手机接口
    app.get('/api/phone/code/', controllers.api.phone.getCode);
    app.get('/api/phone/code/validate/', controllers.api.phone.getCodeValidate);
    app.get('/api/phone/register-code/', controllers.api.phone.getRegisterCode);
    app.get('/api/phone/bind-code/', controllers.api.phone.getBindCode);
    app.get('/api/phone/password-code/', controllers.api.phone.getPasswordCode);
    app.post('/api/phone/bind/', controllers.api.phone.postBind);

    // 邮件接口
    app.post('/api/email/bind/', controllers.api.email.postBind);

    // 图像验证码接口
    app.get('/api/captcha/image/:sessionId/', controllers.api.captcha.getImage);
    app.get('/api/captcha/validate/:sessionId/', controllers.api.captcha.getValidate);

    // 用户接口
    app.post('/api/user/login/', controllers.api.user.postLogin);
    app.post('/api/user/logout/', controllers.api.user.postLogout);
    app.post('/api/user/auth/', controllers.api.user.postAuth);
    app.post('/api/user/register/', controllers.api.user.postRegister);
    app.post('/api/user/bind/', controllers.api.user.postBind);
    app.post('/api/user/apply/', controllers.api.user.postApply);
    app.post('/api/user/apply/domain/', controllers.api.user.postDomainTest);
    app.get('/api/user/clubs/', controllers.api.user.getClubs);
    app.post('/api/user/password/emailAccount/', controllers.api.user.postEmailAccount);
    app.post('/api/user/password/mobileAccount/', controllers.api.user.postMobileAccount)
    app.post('/api/user/password/mobileSign/', controllers.api.user.postMobileSign);
    app.post('/api/user/desktop-password/', controllers.api.user.postSetPwd);
    app.post('/api/user/mobile-password/', controllers.api.user.postMobileSetPwd);

    // 账户接口
    app.all(/^\/api\/account\/.*$/, controllers.erp.middleware.getCurrentUser);
    app.all(/^\/api\/account\/.*$/, controllers.erp.middleware.getCurrentClub);
    app.all(/^\/api\/account\/.*$/, controllers.erp.middleware.getCashAccount);
    app.post('/api/account/set-cash-password/', controllers.api.account.postSetPassword);
    app.post('/api/account/reset-cash-password/', controllers.api.account.postResetPassword);
    app.post('/api/account/validate-cash-password/', controllers.api.account.postValidatePassword);
    app.post('/api/account/change-cash-password/', controllers.api.account.postChangePassword);
    app.post('/api/account/save-alipay/', controllers.api.account.postSaveAlipay);
    app.post('/api/account/bind-alipay/', controllers.api.account.postBindAlipay);
    app.post('/api/account/validate-alipay/', controllers.api.account.postValidateAlipay);
    app.get('/api/account/bills/', controllers.api.account.getBillList);
    app.get('/api/account/cashes/', controllers.api.account.getCashesList);
    app.post('/api/account/apply-cash/', controllers.api.account.postApplyCash);

    //活动接口
    app.post('/api/activity/refund-handle/', controllers.api.activity.postRefundOrder);
    app.get('/api/activity/refund-detail/', controllers.api.activity.getRefundDetail);
    app.post('/api/activity/refund-amount/', controllers.api.activity.postRefundAmount);
    app.get('/api/activity/refund-list/', controllers.api.activity.getRefundPerform);
    app.post('/api/activity/activity-list/', controllers.api.activity.postActivityList);
    app.post('/api/activity/activity-close/', controllers.api.activity.postCancelActivity);
    //发布活动接口
    app.post('/api/activity/', controllers.api.activity.postActivity);
    app.post('/api/activity/type/', controllers.api.activity.postType);
    app.post('/api/activity/draft/', controllers.api.activity.postDraft);


    // 地址接口
    app.get('/api/address/country/', controllers.api.address.getCountry);
    app.get('/api/address/province/', controllers.api.address.getProvince);
    app.get('/api/address/city/', controllers.api.address.getCity);
    app.get('/api/address/id/', controllers.api.address.getId);

    // 上传接口
    app.get('/api/upload/token/', controllers.erp.middleware.getCurrentUser,
        controllers.erp.middleware.getCurrentClub,
        controllers.api.upload.getToken);
    app.post('/api/upload/', uploadParser.single('file'), controllers.api.upload.postUpload);

    // 程序路由优先，最后静态路由
    app.use('/', express.static(configs.webroot, staticOptions));

    // 监控检查
    app.get('/version.jsp', controllers.main.getVersion);

    // 路由终点
    app.use(controllers.middleware.clientError);
    app.use(controllers.middleware.serverError);

    next(null, app);
};



