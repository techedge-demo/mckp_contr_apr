/*global location */
sap.ui.define([
		"sap/ui/demo/masterdetail/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/demo/masterdetail/model/formatter"
	], function (BaseController, JSONModel, formatter) {
		"use strict";

		return BaseController.extend("sap.ui.demo.masterdetail.controller.Detail", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			onInit : function () {
				// Model used to manipulate control states. The chosen values make sure,
				// detail page is busy indication immediately so there is no break in
				// between the busy indication for loading the view's meta data
				var oViewModel = new JSONModel({
					busy : false,
					delay : 0,
					lineItemListTitle : this.getResourceBundle().getText("detailLineItemTableHeading")
				});

				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

				this.setModel(oViewModel, "detailView");

				var oTable =this.getView().byId("idObservaTable");
				var aItems = oTable.getItems();
				aItems[2].addStyleClass("blue");
				this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * Event handler when the share by E-Mail button has been clicked
			 * @public
			 */
			onShareEmailPress : function () {
				var oViewModel = this.getModel("detailView");

				sap.m.URLHelper.triggerEmail(
					null,
					oViewModel.getProperty("/shareSendEmailSubject"),
					oViewModel.getProperty("/shareSendEmailMessage")
				);
			},


			/**
			 * Updates the item count within the line item table's header
			 * @param {object} oEvent an event containing the total number of items in the list
			 * @private
			 */
			onListUpdateFinished : function (oEvent) {
				var sTitle,
					iTotalItems = oEvent.getParameter("total"),
					oViewModel = this.getModel("detailView");

				// only update the counter if the length is final
//				if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
//					if (iTotalItems) {
//						sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
//					} else {
//						//Display 'Line Items' instead of 'Line items (0)'
//						sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
//					}
//					oViewModel.setProperty("/lineItemListTitle", sTitle);
//				}
			},

			/* =========================================================== */
			/* begin: internal methods                                     */
			/* =========================================================== */

			/**
			 * Binds the view to the object path and expands the aggregated line items.
			 * @function
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
			 * @private
			 */
			_onObjectMatched : function (oEvent) {
				var sObjectId =  oEvent.getParameter("arguments").objectId;
				this.getModel().metadataLoaded().then( function() {
					var sObjectPath = this.getModel().createKey("Objects", {
						ObjectID :  sObjectId
					});
					this._bindView("/" + sObjectPath);
				}.bind(this));
			},

			/**
			 * Binds the view to the object path. Makes sure that detail view displays
			 * a busy indicator while data for the corresponding element binding is loaded.
			 * @function
			 * @param {string} sObjectPath path to the object to be bound to the view.
			 * @private
			 */
			_bindView : function (sObjectPath) {
				// Set busy indicator during view binding
				var oViewModel = this.getModel("detailView");

				// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
				oViewModel.setProperty("/busy", false);

				this.getView().bindElement({
					path : sObjectPath,
					events: {
						change : this._onBindingChange.bind(this),
						dataRequested : function () {
							oViewModel.setProperty("/busy", true);
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
				var oView = this.getView(),
					oElementBinding = oView.getElementBinding();

				// No data for the binding
				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("detailObjectNotFound");
					// if object could not be found, the selection in the master list
					// does not make sense anymore.
					this.getOwnerComponent().oListSelector.clearMasterListSelection();
					return;
				}

				var sPath = oElementBinding.getPath(),
					oResourceBundle = this.getResourceBundle(),
					oObject = oView.getModel().getObject(sPath),
					sObjectId = oObject.ObjectID,
					sObjectName = oObject.Name,
					oViewModel = this.getModel("detailView");

				this.getOwnerComponent().oListSelector.selectAListItem(sPath);

				oViewModel.setProperty("/shareSendEmailSubject",
					oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
				oViewModel.setProperty("/shareSendEmailMessage",
					oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
			},

			_onMetadataLoaded : function () {
				// Store original busy indicator delay for the detail view
				var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
					oViewModel = this.getModel("detailView");
//					oLineItemTable = this.byId("lineItemsList"),
					//iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

				// Make sure busy indicator is displayed immediately when
				// detail view is displayed for the first time
				oViewModel.setProperty("/delay", 0);
				oViewModel.setProperty("/lineItemTableDelay", 0);

//				oLineItemTable.attachEventOnce("updateFinished", function() {
//					// Restore original busy indicator delay for line item table
//					oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
//				});

				// Binding the view will set it to not busy - so the view is always busy if it is not bound
				oViewModel.setProperty("/busy", true);
				// Restore original busy indicator delay for the detail view
				oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
			},
			
			
			onPressAccept : function (oEvent) {
				sap.m.MessageToast.show('Aprobar	', {
			        duration: 200
				});	
			},
			
			
			onPressCancel : function (oEvent) {
				this.onOpenViewSettingsDialog();				
			},
			
			
			onPressEdit : function (oEvent) {
				this.onOpenViewSettingsDialog3();					
			},
			
			
			onPressReasing : function (oEvent) {
				sap.m.MessageToast.show('Reasignar', {
			        duration: 200
				});
			},
			
			
			onPressClose : function (oEvent) {
				sap.m.MessageToast.show('Cerrar', {
			        duration: 200
				});				
			},
			
			
			onOpenViewSettingsDialog : function () {
				if (!this._oViewSettingsDialog) {
					this._oViewSettingsDialog = sap.ui.xmlfragment("sap.ui.demo.masterdetail.view.ViewSettingsDialog", this);
					this.getView().addDependent(this._oViewSettingsDialog);
					// forward compact/cozy style into Dialog
					this._oViewSettingsDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
				}
				this._oViewSettingsDialog.open();
			},
			
			
			onOpenViewSettingsDialog2 : function () {
				if (!this._oViewSettingsDialog2) {
					this._oViewSettingsDialog2 = sap.ui.xmlfragment("sap.ui.demo.masterdetail.view.ViewSettingsDialog2", this);
					this.getView().addDependent(this._oViewSettingsDialog2);
					// forward compact/cozy style into Dialog
					this._oViewSettingsDialog2.addStyleClass(this.getOwnerComponent().getContentDensityClass());
				}
				this._oViewSettingsDialog2.open();
			},
			
			onOpenViewSettingsDialog3 : function () {
				if (!this._oViewSettingsDialog3) {
					this._oViewSettingsDialog3 = sap.ui.xmlfragment("sap.ui.demo.masterdetail.view.ViewSettingsDialog3", this);
					this.getView().addDependent(this._oViewSettingsDialog3);
					// forward compact/cozy style into Dialog
					this._oViewSettingsDialog3.addStyleClass(this.getOwnerComponent().getContentDensityClass());
				}
				this._oViewSettingsDialog3.open();
			},
			
			
			closeDialogRechazar : function(oEvent){
				console.log("Close");
				if(oEvent.getSource().getParent()){
					oEvent.getSource().getParent().close();
				}
			},

			
			closeDialogModificar : function(oEvent){
				console.log("Close");
				if(oEvent.getSource().getParent()){
					oEvent.getSource().getParent().close();
				}
			},
			
			acceptDialogModificar : function(oEvent){
				console.log("Aceptar Modificar");
				if(oEvent.getSource().getParent()){
					oEvent.getSource().getParent().close();
					this.setNoEditableFields();
				}
			},
			
			
			setEditableFields : function(){
				//ToolbarButton 
				this.getView().byId("idAprobar").setVisible(false);
				this.getView().byId("idRechazar").setVisible(false);
				this.getView().byId("idModificar").setVisible(false);
				this.getView().byId("idReasignar").setVisible(false);
//				this.getView().byId("idCerrar").setVisible(false);
				this.getView().byId("idGuardar").setVisible(true);
				this.getView().byId("idInfo").setVisible(false);
				this.getView().byId("idPrint").setVisible(false);
				
				         
				
				//TAB: 2
				this.getView().byId("idInputReasonincorporation").setEditable(true);
				this.getView().byId("idInputTypeofcontract").setEditable(true);
				this.getView().byId("idInputIncorporationexpecteddate").setEditable(true);
				this.getView().byId("idInputjustification").setEditable(true);
				this.getView().byId("idInputCollectiveagreement").setEditable(true);
				this.getView().byId("idInputDurationproposal").setEditable(true);
				this.getView().byId("idInputDurationproposal2").setEditable(true);
				this.getView().byId("idInputProfessionalgroup").setEditable(true);
				this.getView().byId("idInputProposedsalaryband").setEditable(true);
				this.getView().byId("idInputProposedsalaryband2").setEditable(true);
				this.getView().byId("idInputJob").setEditable(true);
				
				//TAB: 3
				this.getView().byId("idInputTrainingrequired").setEditable(true);
				this.getView().byId("idInputInitdate").setEditable(true);
				this.getView().byId("idInputAcademicdegree").setEditable(true);
				this.getView().byId("idInputEnddate").setEditable(true);
				this.getView().byId("idInputSpecialty").setEditable(true);
				this.getView().byId("idInputFunctions").setEditable(true);
				this.getView().byId("idInputEducationalentity").setEditable(true);
				
				
				//TAB: 4
				this.getView().byId("idInputSurname").setEditable(true);
				this.getView().byId("idInputSecondsurname").setEditable(true);
				this.getView().byId("idInputName").setEditable(true);
				this.getView().byId("idInputDni").setEditable(true);
				this.getView().byId("idInputSalaryapproved").setEditable(true);
				this.getView().byId("idInputApprovedvarremuneration").setEditable(true);
				
				//TAB: 5   	             
				this.getView().byId("idInputRequestedchange").setEditable(true);
				this.getView().byId("idInputModificationoptions").setEditable(true);						               
			},
			
			setNoEditableFields : function(){ 
				//ToolbarButton 
				this.getView().byId("idAprobar").setVisible(true);
				this.getView().byId("idRechazar").setVisible(true);
				this.getView().byId("idModificar").setVisible(true);
				this.getView().byId("idReasignar").setVisible(true);
//				this.getView().byId("idCerrar").setVisible(true);
				this.getView().byId("idGuardar").setVisible(false);
				this.getView().byId("idInfo").setVisible(true);
				this.getView().byId("idPrint").setVisible(true);
				         
				
				//TAB: 2
				this.getView().byId("idInputReasonincorporation").setEditable(false);
				this.getView().byId("idInputTypeofcontract").setEditable(false);
				this.getView().byId("idInputIncorporationexpecteddate").setEditable(false);
				this.getView().byId("idInputjustification").setEditable(false);
				this.getView().byId("idInputCollectiveagreement").setEditable(false);
				this.getView().byId("idInputDurationproposal").setEditable(false);
				this.getView().byId("idInputDurationproposal2").setEditable(false);
				this.getView().byId("idInputProfessionalgroup").setEditable(false);
				this.getView().byId("idInputProposedsalaryband").setEditable(false);
				this.getView().byId("idInputProposedsalaryband2").setEditable(false);
				this.getView().byId("idInputJob").setEditable(false);
				
				//TAB: 3
				this.getView().byId("idInputTrainingrequired").setEditable(false);
				this.getView().byId("idInputInitdate").setEditable(false);
				this.getView().byId("idInputAcademicdegree").setEditable(false);
				this.getView().byId("idInputEnddate").setEditable(false);
				this.getView().byId("idInputSpecialty").setEditable(false);
				this.getView().byId("idInputFunctions").setEditable(false);
				this.getView().byId("idInputEducationalentity").setEditable(false);
				
				
				//TAB: 4
				this.getView().byId("idInputSurname").setEditable(false);
				this.getView().byId("idInputSecondsurname").setEditable(false);
				this.getView().byId("idInputName").setEditable(false);
				this.getView().byId("idInputDni").setEditable(false);
				this.getView().byId("idInputSalaryapproved").setEditable(false);
				this.getView().byId("idInputApprovedvarremuneration").setEditable(false);
				
				//TAB: 5   	             
				this.getView().byId("idInputRequestedchange").setEditable(false);
				this.getView().byId("idInputModificationoptions").setEditable(false);		
			},

			
			onPressGuardar : function(){					
				this.onOpenViewSettingsDialog2();
							               
			},
			
			onPressImprimir: function(){
				sap.m.MessageToast.show('Imprimiendo', {
			        duration: 200
				});
			},
			

			acceptDialogAcceptSave : function(oEvent){
				this.setEditableFields();
				if(oEvent.getSource().getParent()){
					oEvent.getSource().getParent().close();
				}
			},
			
			
			onPressAddObser : function(){
				sap.m.MessageToast.show('Añadir Observación', {
			        duration: 200
				});				
			},
			
			onPressInfo : function(){
				sap.m.MessageToast.show('Solicitar información', {
			        duration: 200
				});		
			},
			
			
			closeDialogCancelSave: function(oEvent){
				console.log("Close");
				if(oEvent.getSource().getParent()){
					oEvent.getSource().getParent().close();
				}				
			}			

		});

	}
);