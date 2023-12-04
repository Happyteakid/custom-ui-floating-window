import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import logger from '../shared/logger';

const log = logger('Functions API 📚');
const axios = require('axios');
const gusToken = process.env.API_REGON;

export function isValidNip(nip) {
    if (typeof nip !== 'string')
        return false;

    let weight = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    let sum = 0;
    let controlNumber = parseInt(nip.substring(9, 10));
    let weightCount = weight.length;
    for (let i = 0; i < weightCount; i++) {
        sum += (parseInt(nip.substr(i, 1)) * weight[i]);
    }

    return sum % 11 === controlNumber;
}

export function soap(nip) {
    console.log('Start function soap \nNip:'+ nip);
    console.log('gus token'+gusToken);
    log.info('Start function soap \nNip:'+ nip);

    const xmlBody = '  <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ns="http://CIS/BIR/PUBL/2014/07">'+
    ' <soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing">'+
       '<wsa:To>https://wyszukiwarkaregontest.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc</wsa:To>'+
       '<wsa:Action>http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Zaloguj</wsa:Action>'+
     '</soap:Header>'+
     '<soap:Body>'+
       '<ns:Zaloguj>'+
        ' <ns:pKluczUzytkownika>klucz</ns:pKluczUzytkownika>'+
       '</ns:Zaloguj>'+
     '</soap:Body>'+
   '</soap:Envelope>';

  axios.post('https://your-soap-api-endpoint', xmlBody, {
    headers: {
      'Content-Type': 'text/xml;charset=UTF-8',
      'SOAPAction': 'your-SOAP-action-if-required'
    }
  })
  .then(response => {
    console.log('Response:', response.data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
}



export default {isValidNip, soap};