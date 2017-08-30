import { Meteor} from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
    //meteor.publish permet d'enregistrer une publication intitulée tâches
    Meteor.publish('tasks', function tasksPublication() {
        return Tasks.find({
            //Maintenant que nous avons un moyen de définir quelles tâches sont privées, nous
            //devrions modifier notre fonction de publication pour envoyer uniquement les tâches qu'un utilisateur est autorisé à voir:
            $or: [{
                private: {
                    $ne: true
                }
            }, {
                owner: this.userId
            },],
        });
    });
}
Meteor.methods({
    //nous devons définir certaines méthodes
    //besoin d'une méthode pour chaque opération de base de données que nous voulons effectuer sur le client
    // les méthodes doivent être définies dans le code qui est exécuté sur le client et le serveur
    'tasks.insert' (text) {
        check(text, String);
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Tasks.insert({
            text,
            createdAt : new Date(),
            owner:Meteor.userId(),
            username: Meteor.user().username,
        });
        },
    'tasks.remove' (taskId) {
        check(taskId, String);
        //Sécurité de méthode supplémentaire

        //Afin de terminer notre fonctionnalité de tâche privée, nous devons ajouter des vérifications à nos méthodes
        //deleteTask et setChecked pour s'assurer que seul le propriétaire de la tâche peut supprimer ou vérifier une tâche privée:
        const task = Tasks.findOne(taskId);
        if (task.private && task.owner !==Meteor.userId()) {
            throw new Meteor.Error ('not-authorized');
        }

        Tasks.remove(taskId);
    },
    'tasks.setChecked' (taskId, setChecked) {
        check (taskId, String);
        check(setChecked, Boolean);
        const task = Tasks.findOne(taskId);
        if (task.private && task.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        //avec ce code, n'importe qui peut supprimer toute tâche publique.
        Tasks.update(taskId, {
            $set:{
                checked: setChecked
            }
        });
    },
    'tasks.setPrivate' (taskId, setToPrivate) {
        check (taskId, String);
        check(setToPrivate, Boolean);

        const task = Tasks.findOne(taskId);
        //il faut s'assurer que seul le propriétaire de la tâche peut rendre une tâche privée
        if (task.ower !==Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Tasks.update(taskId, {
            $set: {
                private: setToPrivate
            }
        });
    },
});