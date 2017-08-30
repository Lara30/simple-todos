//pour configurer l'interface utilisateur des comptes pour utiliser les noms d'utilisateur au lieu des adresses e-mail:
import { Accounts } from 'meteor/accounts-base';
Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY',
});

