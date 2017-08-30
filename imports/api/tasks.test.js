import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

import { Tasks } from './tasks.js';

if (Meteor.isServer) {
    //Ici, nous créons une seule tâche associée à un ID utilisateur aléatoire qui sera différent pour chaque essai.
    describe('Tasks', () => {
        describe('methods', () => {
            const userId = Random.id();
            let taskId;
            beforeEach(()=> {
                //Maintenant, nous pouvons écrire le test pour appeler la méthode task.remove "en tant que" cet utilisateur et
                // vérifier que la tâche est supprimée:
                Tasks.remove({});
                taskId = Tasks.insert({
                    text:'test task',
                    createdAt: new Date(),
                    owner: userId,
                    username: 'tmeasday',
                });
            });
            it('can delete owned task', () => {
                const deleteTask = Meteor.server.method_handlers['tasks.remove'];
                const invocation = {
                    userId
                };
                deleteTask.apply(invocation, [taskId]);
                assert.equal(Tasks.find().count(), 0);
            });
        });
    });
}