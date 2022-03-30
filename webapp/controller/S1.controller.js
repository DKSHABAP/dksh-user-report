sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/dksh/UserReport/model/ExcelUtil",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet'
], function (Controller, ExcelUtil, Export, ExportTypeCSV, exportLibrary, Spreadsheet) {
	"use strict";
	var controller;
	var EdmType = exportLibrary.EdmType;
	return Controller.extend("com.dksh.UserReport.controller.S1", {
		onInit: function () {
			controller = this;
			this.getUsers();
		},
		getUsers: function () {
			var oLoggedInUserDetailModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oLoggedInUserDetailModel, "oLoggedInUserDetailModel");
			// Service to getLogged in User
			// oLoggedInUserDetailModel.loadData("/IDPService/service/scim/Users?filter=addresses.country eq \"TH\"&startIndex=300&count=100", null, true);
			oLoggedInUserDetailModel.loadData("/DKSHJavaService/userDetails/getUsers", null, true);
			// /DKSHJavaService/userDetails/getUsers
			oLoggedInUserDetailModel.attachRequestCompleted(function (oEvent) {

				var startDate = new Date("2022-01-01");
				var endDate = new Date("2022-02-28");
				var users_data = oEvent.getSource().getData().resources;

				var resultProductData = users_data.filter(function (user) {
					var date = new Date(user.meta.created);
					return (date >= startDate && date <= endDate && (user.addresses && user.addresses[0].country === "TH"));
				});
				console.log(resultProductData);
				this.getView().getModel("oLoggedInUserDetailModel").setProperty("/users", resultProductData);
			}.bind(this));
		},
		onDownload: function () {
			// ExcelUtil.exportToExcel(controller.byId("ResultTable"), controller);

			var aCols, aProducts, oSettings, oSheet;

			aCols = this.createColumnConfig();
			aProducts = this.getView().getModel("oLoggedInUserDetailModel").getProperty('/users');

			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: aProducts
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then(function () {
					// MessageToast.show('Spreadsheet export has finished');
				});
			// .finally(oSheet.destroy);
		},
		createColumnConfig: function () {
			return [{
				label: 'User ID',
				property: 'id',
				type: EdmType.Number,
				scale: 0
			}, {
				label: 'User Name',
				property: 'name/givenName',
				type: EdmType.String
			} ,
			{
				label: 'Phone Number',
				property: 'phoneNumbers/0/value',
				type: EdmType.String
			} ,
			{
				label: 'Email Id',
				property: 'emails/0/value',
				type: EdmType.String
			} ,
			{
				label: 'Created On',
				property: 'meta/created',
				type: EdmType.String
			} ,
			{
				label: 'Country',
				property: 'addresses/0/country',
				type: EdmType.String
			} ];
			// onDownload: sap.m.Table.prototype.exportData || function () {

			// var oModel = this.getView().getModel("oLoggedInUserDetailModel");
			// var oExport = new Export({

			// 	exportType: new ExportTypeCSV({
			// 		fileExtension: "csv",
			// 		separatorChar: ";"
			// 	}),
			// 	models: oModel,
			// 	rows: {
			// 		path: "/users"
			// 	},
			// 	columns: [{
			// 		name: "id",
			// 		template: {
			// 			content: "{oLoggedInUserDetailModel>id}"
			// 		}
			// 	}]
			// });
			// // console.log(oExport);
			// oExport.saveFile().catch(function (oError) {

			// }).then(function () {
			// 	oExport.destroy();
			// });
		}
	});
});