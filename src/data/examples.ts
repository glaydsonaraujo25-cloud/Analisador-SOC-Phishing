import { SampleExample } from "../types";

export const SAMPLE_EXAMPLES: SampleExample[] = [
  {
    id: "ex-1",
    title: "🚨 Phishing Bancário - Bloqueio de Chave PIX",
    type: "SMS / Smishing",
    senderInfo: "28490 (Número curto SMS suspeito)",
    message: "BANCO ITAU: Sua chave PIX cadastrada foi bloqueada por tentativas de acesso suspeitas. Para reativar imediatamente e evitar o cancelamento definitivo da conta acesse: https://itau-seguranca-pix-cancelamento.app/regularizar",
    badge: "Phishing Crítico",
    description: "Mensagem induzindo pânico com link mascarado imitando instituição financeira."
  },
  {
    id: "ex-2",
    title: "📦 Smishing de Rastreio - Correios / Alfândega",
    type: "SMS / Smishing",
    senderInfo: "+55 11 98421-9981",
    message: "CORREIOS: Seu pedido BR984219423BR retido na alfandega devido a pendencia de taxa de R$ 18,40. Pague agora para nao perder o pacote: https://correios-rastreio-taxa.xyz/pagar",
    badge: "Golpe de Encomenda",
    description: "Notificação com cobrança de valor baixo em link com TLD .xyz não oficial."
  },
  {
    id: "ex-3",
    title: "🔐 Spear Phishing Corporativo - Reset de Senha TI",
    type: "E-mail",
    senderInfo: "suporte-ti@empresa-corp-security.com (Domínio similar ao oficial)",
    message: "Prezado colaborador,\n\nNossa equipe de Segurança da Informação identificou uma violação de credenciais nos sistemas da empresa. Sua senha expira em 2 horas.\n\nAcesse imediatamente o portal do RH/TI no link abaixo para validar sua senha atual e cadastrar uma nova:\nhttps://login.empresa-corp-security.com/reset\n\nAtenciosamente,\nHelpdesk TI Corporativo",
    badge: "Ameaça Interna",
    description: "Email direcionado que simula suporte técnico de TI solicitando credenciais."
  },
  {
    id: "ex-4",
    title: "💬 Engenharia Social WhatsApp - Falso Parente",
    type: "WhatsApp / Mensagem Instantânea",
    senderInfo: "+55 21 97712-4411 (Perfil com foto do filho)",
    message: "Oi mãe, troquei de número temporariamente porque o meu celular quebrou a tela. Salva esse novo número aí!\n\nPrecisava urgente fazer um PIX de R$ 1.850 pra pagar o mecânico do carro, mas meu aplicativo do banco tá bloqueado no celular novo por 24h. Você consegue transferir pra mim e amanhã de manhã te devolvo sem falta?",
    badge: "Golpe do PIX / Parente",
    description: "Tática de falsa emergência familiar solicitando transferência bancária urgente."
  },
  {
    id: "ex-5",
    title: "🟢 E-mail Legítimo - Notificação de Segurança Google 2FA",
    type: "E-mail",
    senderInfo: "no-reply@accounts.google.com",
    message: "Seu código de verificação do Google é 482910.\n\nEste código é necessário para confirmar seu login em um novo dispositivo (Chrome no Windows). Nunca compartilhe este código com ninguém. Se você não solicitou este código, acesse myaccount.google.com para verificar a segurança da sua conta.",
    badge: "Exemplo Legítimo",
    description: "Notificação padrão sem pedidos de senha, links externos suspeitos ou urgência forçada."
  },
  {
    id: "ex-6",
    title: "🎁 Falso Sorteio / Recarga Grátis",
    type: "Rede Social / DM (Instagram, LinkedIn)",
    senderInfo: "@promocoes_oficial_premiadas",
    message: "PARABÉNS! 🎉 Você foi selecionado entre milhares de seguidores para ganhar um iPhone 15 Pro Max e um vale compras de R$ 5.000,00 da Magazine Luiza!\n\nPara resgatar seu prêmio, você só precisa pagar o frete via PIX (R$ 39,90) e informar seu CPF, nome completo e endereço de entrega no link: https://resgate-premios-magalu.net",
    badge: "Isca / Promessa",
    description: "Promessa exagerada condicionada ao pagamento prévio de frete ou taxa de liberação."
  }
];
