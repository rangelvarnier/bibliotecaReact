import PubSub from 'pubsub-js';

export default class TratadorErros {

    publicaErros(erros) {
        erros.forEach(erro => PubSub.publish('erro-validacao', erro));

    }

}
