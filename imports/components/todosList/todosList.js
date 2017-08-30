import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import { Tasks } from '../../api/tasks.js';

import template from './todosList.html';
class TodosListCtrl {
    constructor($scope) {
        $scope.viewModel(this);
        this.subscribe('tasks');
        this.hideCompleted=false;
        this.helpers({
            tasks() {
                const selector = {};
                //Si hide completed est cochée, filtrez les tâches
                if (this.getReactively('hideCompleted')) {
                    selector.cheked = {
                        $ne: true
                    };
                }
                return Tasks.find(selector, {}, {
                    sort: {
                        createdAt: -1
                    }
                });
            },
            // Maintenant que nous avons écrit une requête qui filtre les tâches complétées, nous pouvons utiliser
            // la même requête pour afficher le nombre de tâches qui n'ont pas été cochées.
            // Pour ce faire, nous devons ajouter une fonction de portée et modifier une ligne du code HTML.
            incompleteCount() {
                return Tasks.find({
                    checked: {
                        $ne: true
                    }
                }).count();
            },
            //nous voulons savoir si l'utilisateur est connecté; on utiliser la fonction helper et nous l'appelons
            //currentUser
            currentUser() {
                return Meteor.user();
            }
        })
    }
    addTask(newTask) {
        // Insert a task into the collection
        Meteor.call('tasks.insert', newTask);
        this.newTask='';
        //nous ajouterons deux nouveaux champs à la collection de tâches : le propriétaire avec l'id de l'utilisateur
        //qui a créé la tâche et le nom d'utilisateur qui a créé la tâche ; nous allons enregistrer le nom d'utilisateur
        // directement dans l'objet de tâche afin de ne pas avoir à chercher l'utilisateur chaque fois que nous affichons
        //la tâche
        Tasks.insert({
            text: newTask,
            createdAt: new Date,
            owner:Meteor.userId(),
            username:Meteor.user().username
        });
        // Add methods for buttons
        this.newTask = '';
    }
    setChecked(task) {
        // Set the checked property to the opposite of its current value
        Meteor.call('tashs.setChecked', task._id, !task.checked);
    }
        /*Tasks.update(task._id, {
            $set: {
                checked: !task.checked
            },
        });
    }*/
    removeTask(task) {
        Meteor.call('tasks.remove', task._id);
        // Tasks.remove(task._id);
    }
    setPrivate (task) {
        Meteor.call ('tasks.setPrivate', task._id, !task.private);
    }
}
export default angular.module('todosList', [
    angularMeteor
    ])

.component ('todosList', {
    templateUrl: 'imports/components/todosList/todosList.html',
    controller: ['$scope', TodosListCtrl]
});