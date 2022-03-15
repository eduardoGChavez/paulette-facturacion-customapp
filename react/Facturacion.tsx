import  React, { Component} from 'react'
import FacturacionContainer from './FacturacionContainer'
import { AppKey, AppToken } from './keys'

interface IMyObject {
  value: string;
  label: string;
}

interface objectFormaPago {
  label: string;
  value: string;
}


interface IState {
  optionsCFDI?: IMyObject[];
  optionsFormaPago?: objectFormaPago[];
  // numeroPedido: string;
  selected1?: string;
  cfdi?: {
    Receiver: {
      Name: string;
      CfdiUse: string;
      Rfc: string;
    };
    CfdiType: string;
    NameId: string;
    ExpeditionPlace: string;
    PaymentForm: string;
    PaymentMethod: string;
    Date: string;
    Items : [];

  };
  Form: {
    numeroPedido: string,
    razonSocial : string,
    correo : string,
    rfc : string,
    calle : string,
    telefono : string,
    estado : string,
    numero : string,
    codigoPostal : string,
    colonia: string,
    ciudad: string,
    usoCFDI : string,
    formaPago: string,
    BetweenStreets : string

  };
  errorRFC : string,
  isLoading : boolean;
  showNotification: boolean;
  dropdownEstados: any;
}

class Facturacion extends Component<IState, IState>{



  constructor(props: any){
    super(props)

    this.handleChangeBilling = this.handleChangeBilling.bind(this)
    this.handleChangeEstado = this.handleChangeEstado.bind(this)
    this.handleChangeForm = this.handleChangeForm.bind(this)
    this.handleChangeFormaPago =this.handleChangeFormaPago.bind(this)
    this.handleChangeUsoCFDI = this.handleChangeUsoCFDI.bind(this)
    this.handleChangeButton = this.handleChangeButton.bind(this)
    this.closeNotification = this.closeNotification.bind(this)
    this.obtenerEstados = this.obtenerEstados.bind(this)
    this.seleccionarEstado = this.seleccionarEstado.bind(this)
    this.verState = this.verState.bind(this)

    this.state = {
      optionsCFDI :[],
      optionsFormaPago :[],
      // numeroPedido : '',
      cfdi : {
        Receiver : {
          Name : '',
          CfdiUse: '',
          Rfc: ''
        },
        CfdiType: '',
        NameId: '',
        ExpeditionPlace: '',
        PaymentForm: '',
        PaymentMethod: '',
        Date : '',
        Items : []
      },
      selected1  : '',
      Form : {
        numeroPedido : '',
        razonSocial : '',
        correo : '',
        rfc : '',
        telefono : '',
        calle : '',
        estado : '',
        numero : '',
        codigoPostal : '',
        colonia : '',
        ciudad : '',
        usoCFDI : '',
        formaPago : '',
        BetweenStreets : ''
      },
      errorRFC: '',
      isLoading : false,
      showNotification : false,
      dropdownEstados : []
    }

    setTimeout(() => {
      this.getFormaPago();
      this.obtenerEstados();
      this.getUsoCFDI();
    }, 1000);
  }


  verState(){
    console.log(this.state)
  }

  async obtenerEstados(){
    var estados : any = null
    try {
      var url = "/api/dataentities/EstadosV1/search?_fields=_all&_schema=mdv1&_sort=estado%20ASC"
      let config = {
        method: 'GET',
        headers:{
          'Accept' : 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin' : '*',
          'X-VTEX-API-AppKey': AppKey,
          'X-VTEX-API-AppToken': AppToken,
          'REST-Range' : 'resources=0-100'
        },
      }
      let res = await fetch(url, config)
      estados = await res.json()

    } catch (error) {
      console.log('Ocurrio un error al obtener estados', error)
      return false;
    }

    if(estados == null){
      alert('Ocurrio un error al obtener estados')
      return false
    }

    for (let i = 0; i < estados.length; i++) {
      let data: any = {}
      data = {
        "value": estados[i].codEstado,
        "label": estados[i].estado
      };

      await this.setState({
        dropdownEstados : this.state.dropdownEstados?.concat(data)
      })
    }
    console.log(this.state)
    return true

  }

  async handleChangeBilling():Promise<any|boolean>{

    if(this.validarFormularios() === false){
        return false;
    }



    this.setState({
      isLoading : true
    })

    let orden = null

    try {
      var url = '/api/oms/pvt/orders/'+ this.state.Form.numeroPedido;
      let config = {
        method: 'GET',
        headers:{
          'Accept' : 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin' : '*',
          'X-VTEX-API-AppKey': AppKey,
          'X-VTEX-API-AppToken': AppToken
        },
      }
      let res = await fetch(url, config)
      orden = await res.json()
    } catch (error) {
      alert('Ocurrio un error al momento de procesar los datos')
      console.log(error);
      this.setState({isLoading : false})
      return false;
    }


    if(orden.error){
      alert('Orden no encontrada, verifique el numero de orden, ejemplo: 0000000000000-00')
      this.setState({isLoading : false})
      return false
    }

    var warehouseId = null;
    if(orden.shippingData.logisticsInfo.length > 0){
      if(orden.shippingData.logisticsInfo[0].deliveryIds.length > 0){
        warehouseId = orden.shippingData.logisticsInfo[0].deliveryIds[0].warehouseId;
      }
      else{
        alert('No se encontro datos de la sucursal, contacte con el administrador del sistema')
      return false;
      }
    }
    else{
      alert('No se encontro datos de la sucursal, contacte con el administrador del sistema')
      return false;
    }

    if (warehouseId == null){
      alert('No se encontro datos de la sucursal, contacte con el administrador del sistema')
      return false;
    }

    const fecha = new Date();

    let data: any = {}
    data = {
      "NumeroPedido" : this.state.Form.numeroPedido,
      "Name": this.state.Form.razonSocial,
      "Email" : this.state.Form.correo,
      "PhoneNumber" : this.state.Form.telefono,
      "CfdiUse": this.state.Form.usoCFDI,
      "Rfc": this.state.Form.rfc,
      "PaymentMethod": this.state.Form.formaPago,
      "Date": fecha,
      "Street": this.state.Form.calle,
      "AddressNumber" : this.state.Form.numero,
      "BetweenStreets" : this.state.Form.BetweenStreets,
      "PostalCode": this.state.Form.codigoPostal,
      "Suburb": this.state.Form.colonia,
      "City": this.state.Form.ciudad,
      "State" : this.state.Form.estado,
      "Status": "1"
    };


   try {
      var url = '/api/dataentities/FacturacionV3/documents?_schema=mdv1';
      let config = {
        method: 'PATCH',
        headers:{
          'Accept': 'application/vnd.vtex.ds.v10+json',
          'Content-Type': 'application/json',
          'X-VTEX-API-AppKey': AppKey,
          'X-VTEX-API-AppToken': AppToken
        },
        body: JSON.stringify(data)
      }
      let res = await fetch(url, config)
      var response = await res.json()
      console.log(response)

    } catch (error) {
      alert(error)
      console.log(error);
      this.setState({isLoading : false})
      return false;
    }

    this.FormClean();
    this.setState({isLoading : false, showNotification: true })
    return false;
  }


  async handleChangeEstado(selected: any){
    var value = selected['selected1'];
    await this.setState({
      selected1 : value
    })
  }

  async handleChangeForm(e: React.FormEvent<HTMLInputElement>){
    const {name, value} = e.currentTarget;
    this.setState({
      ...this.state,
      Form: { ...this.state.Form, [name]: value}
    })
    if(name == 'rfc'){
      console.log(this.rfcValido(value))

      if(this.rfcValido(value) === false){
        this.setState({ errorRFC : 'Ingresa un RFC valido' })
      }
      else{
        await this.setState({ errorRFC : '' })
        // this.getUsoCFDI(value);
      }
    }
  }

  closeNotification(flag : any){
    this.setState({
      showNotification : flag
    })
    // console.log(this.state.showNotification);
  }



  async handleChangeFormaPago(value: any){
    // console.log(label.currentTarget);
    var value1 = value['value'];
    // console.log(value1);

    this.setState({
      ...this.state,
      Form: { ...this.state.Form, ['formaPago']: value1}
    })
  }

  async handleChangeUsoCFDI(value: any){
    var valueCFDI = value['value'];
    this.setState({
      ...this.state,
      Form: { ...this.state.Form, ['usoCFDI']: valueCFDI  }
    })
  }


  async getUsoCFDI(){

    var razonDFI : any = null
    try {
      var url = "/api/dataentities/UsoCFDIV1/search?_fields=_all&_schema=mdv1"
      let config = {
        method: 'GET',
        headers:{
          'Accept' : 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin' : '*',
          'X-VTEX-API-AppKey': AppKey,
          'X-VTEX-API-AppToken': AppToken
        },
      }
      let res = await fetch(url, config)
      razonDFI = await res.json()

    } catch (error) {
      console.log('Ocurrio un error al obtener estados', error)
      return false;
    }

    for (var i = 0; i < razonDFI.length; i++) {
      var obj = [{value: razonDFI[i].clave, label:razonDFI[i].tipo}]
      this.setState({
        optionsCFDI: this.state.optionsCFDI?.concat(obj)
      })
    }

    return true
  }


  handleChangeButton(flag: any){
    // console.log(flag);
    this.setState({
      isLoading : flag
    })
  }

  async getFormaPago(){
    var formaPago = [];


    try {
      var url = "/api/dataentities/FormasPagoV1/search?_fields=_all"
      let config = {
        method: 'GET',
        headers:{
          'Accept' : 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin' : '*',
          'X-VTEX-API-AppKey': AppKey,
          'X-VTEX-API-AppToken': AppToken
        },
      }
      let res = await fetch(url, config)
      formaPago = await res.json()

    } catch (error) {
      console.log('Ocurrio un error al obtener las formas de pago', error)
      return false;
    }

    for (var i = 0; i < formaPago.length; i++) {
      var obj = [{value: formaPago[i].codigo, label:formaPago[i].descripcion}]
      await this.setState({
        optionsFormaPago: this.state.optionsFormaPago?.concat(obj)
      })
    }

    if(this.state.optionsFormaPago?.length == 0){
      setTimeout(() => {
        this.getFormaPago();
      }, 7000);
    }
    return false;

  }


  validarFormularios(){
    if(this.state.Form.numeroPedido === '' || this.state.Form.numeroPedido === null ){
      alert('Ingrese su numero de pedido')
      return false
    }

    if(this.state.Form.razonSocial === '' || this.state.Form.razonSocial === null ){
      alert('Ingrese la razon social')
      return false
    }

    if(this.state.Form.rfc === '' || this.state.Form.rfc === null ){
      alert('Ingrese el RFC')
      return false
    }

    if(this.state.Form.correo === '' ||this.state.Form.correo === null){
      alert('Ingrese el correo electronico')
      return false
    }

    if (this.validateEmail(this.state.Form.correo) === false) {
      alert('Ingrese el correo correctamente');
      return false
    }

    if(this.state.Form.telefono === '' || this.state.Form.telefono === null || this.state.Form.telefono == '0'){
      alert('Ingrese el telefono');
      return false
    }

    if(this.state.Form.calle === '' || this.state.Form.calle === null){
      alert('Ingrese la calle')
      return false
    }

    if(this.state.Form.numero === '' || this.state.Form.numero === null){
      alert('Ingrese el numero')
      return false
    }

    if(this.state.Form.codigoPostal === '' || this.state.Form.codigoPostal === null){
      alert('Ingrese el codigo postal')
      return false
    }

    var isNumber = /^[0-9]+$/;
    if (!this.state.Form.codigoPostal.match(isNumber)){
      alert('El codigo postal debe de ser Numerico')
      return false
   }

   if(this.state.Form.BetweenStreets === '' || this.state.Form.BetweenStreets === null){
      alert('Ingresa las entre calles de tu domicilio')
      return false
    }

    if(this.state.Form.colonia === '' || this.state.Form.colonia === null){
      alert('Ingrese la colonia')
      return false
    }

    if(this.state.Form.ciudad === '' || this.state.Form.ciudad === null){
      alert('Ingrese la ciudad')
      return false
    }

    if(this.state.Form.estado === '' || this.state.Form.estado === null){
      alert('Seleccione el estado')
      return false
    }

    if(this.state.Form.usoCFDI === '' || this.state.Form.usoCFDI === null){
      alert('Seleccione el uso de CFDI')
      return false
    }

    if(this.state.Form.formaPago === '' || this.state.Form.formaPago === null){
      alert('Seleccione la forma de pago')
      return false
    }
    return true;
  }


  FormClean(){
    this.setState({
      Form : {
        numeroPedido : '',
        razonSocial : '',
        correo : '',
        rfc : '',
        telefono : '',
        calle : '',
        estado : '',
        numero : '',
        codigoPostal : '',
        colonia : '',
        ciudad : '',
        usoCFDI : '',
        formaPago : '',
        BetweenStreets : ''
      }
    })

  }


  validateEmail(email: any) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  rfcValido(rfc: string, aceptarGenerico = true) {
    const re = /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/;
    var validado = rfc.match(re);

    if (!validado)  // Coincide con el formato general del regex?
        return false;

    // Separar el dígito verificador del resto del RFC
    const digitoVerificador = validado.pop(),
        rfcSinDigito = validado.slice(1).join(''),
        len = rfcSinDigito.length,

        // Obtener el digito esperado
        diccionario = "0123456789ABCDEFGHIJKLMN&OPQRSTUVWXYZ Ñ",
        indice = len + 1;
    var suma,
        digitoEsperado;

    if (len == 12) suma = 0
    else suma = 481; // Ajuste para persona moral

    for (var i = 0; i < len; i++)
        suma += diccionario.indexOf(rfcSinDigito.charAt(i)) * (indice - i);
    digitoEsperado = 11 - suma % 11;
    if (digitoEsperado == 11) digitoEsperado = 0;
    else if (digitoEsperado == 10) digitoEsperado = "A";

    // El dígito verificador coincide con el esperado?
    // o es un RFC Genérico (ventas a público general)?
    if ((digitoVerificador != digitoEsperado)
        && (!aceptarGenerico || rfcSinDigito + digitoVerificador != "XAXX010101000"))
        return false;
    else if (!aceptarGenerico && rfcSinDigito + digitoVerificador == "XEXX010101000")
        return false;
    return rfcSinDigito + digitoVerificador;
}


async seleccionarEstado(estadoSeleccionado : any){
  this.setState({
    Form : {
      ...this.state.Form,
      estado : estadoSeleccionado.seleccion
    }

  })
}


  render(){
		return <FacturacionContainer
              handleChangeBilling={this.handleChangeBilling}
              // handleChangeEstado={this.handleChangeEstado}
              state={this.state}
              handleChangeForm={this.handleChangeForm}
              handleChangeFormaPago={this.handleChangeFormaPago}
              handleChangeUsoCFDI = {this.handleChangeUsoCFDI}
              closeNotification = {this.closeNotification}
              seleccionarEstado = {this.seleccionarEstado}
              verState = {this.verState}
            />
	}

}

export default Facturacion
