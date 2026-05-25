// Middleware de upload de arquivos (usando multer).
// O multer e responsavel por receber arquivos enviados em formularios
// (input type="file") e salvar no disco.

const path = require('path');
const multer = require('multer');

// "diskStorage" = salva os arquivos no disco (em vez de manter na memoria).
const storage = multer.diskStorage({
  // Pasta onde os arquivos serao salvos.
  destination: (req, file, cb) => {
    // cb = callback. O primeiro argumento e o erro (null = sem erro).
    cb(null, path.join(__dirname, '..', 'public', 'uploads', 'avatars'));
  },

  // Nome do arquivo salvo. Evitamos usar o nome original (que pode conflitar
  // ou ter caracteres estranhos). Padrao: "{idDoUsuario}_{timestamp}.{ext}"
  filename: (req, file, cb) => {
    const userId = req.session.usuario ? req.session.usuario.id : 'anon';
    // path.extname pega a extensao com o ponto (ex: ".jpg").
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${userId}_${Date.now()}${ext}`);
  }
});

// Filtro: so aceita imagens.
function fileFilter(req, file, cb) {
  // file.mimetype vem do navegador, ex: "image/jpeg", "image/png".
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);  // aceita
  } else {
    cb(new Error('Apenas imagens sao permitidas.'), false); // rejeita
  }
}

// Cria a instancia do multer com nossas configuracoes.
const upload = multer({
  storage,
  fileFilter,
  limits: {
    // Limite: 2 MB. Mais que isso, o multer rejeita.
    fileSize: 2 * 1024 * 1024
  }
});

module.exports = upload;
