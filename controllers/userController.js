const { INTERNAL_SERVER_ERROR, OK, BAD_REQUEST, UNAUTHORIZED } = require("../helpers/statusCodes");
require('dotenv').config();
const { db } = require("../firebase/config");
const { doc, getDoc, deleteDoc } = require('firebase/firestore');
const admin = require('firebase-admin');

const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
};
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

async function getDataById(collectionName, id) {
    try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.log("Nenhum documento encontrado!");
            return null;
        }
    } catch (error) {
        console.error("Erro ao buscar documento:", error);
    }
}

async function deleteDataById(collectionName, id) {
    try {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
        console.log(`Documento ${id} deletado com sucesso da coleção ${collectionName}.`);
    } catch (error) {
        console.error("Erro ao deletar o documento:", error);
    }
}

module.exports = class UserController {
    static async deleteUser(req, res) {
        const userUid = req.params.id;
        const { adminUid } = req.body;

        if (!userUid || !adminUid) {
            return res.status(BAD_REQUEST).send({ error: 'Parâmetros userUid ou adminUid não fornecidos.' });
        }

        try {
            const adminData = await getDataById("admins", adminUid);
            if (!adminData) {
                return res.status(UNAUTHORIZED).send({ error: 'Erro, somente admins podem deletar usuários.' });
            }

            await admin.auth().deleteUser(userUid);
            await deleteDataById("users", userUid);

            return res.status(OK).send({ message: `Usuário com UID ${userUid} deletado com sucesso!` });
        } catch (error) {
            console.error('Erro ao deletar o usuário:', error.message);
            return res.status(INTERNAL_SERVER_ERROR).send({ error: 'Erro ao deletar o usuário.', details: error.message });
        }
    }
}