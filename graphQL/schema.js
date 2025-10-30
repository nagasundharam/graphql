const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLBoolean,
} = require('graphql');
const Task = require('../models/Task');

// -------------------- Task GraphQL Type --------------------
const TaskType = new GraphQLObjectType({
  name: 'Task',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    status: { type: GraphQLString },
    priority: { type: GraphQLString },
    assignedTo: { type: GraphQLString },
    project: { type: GraphQLString },
    tags: { type: new GraphQLList(GraphQLString) },
    dueDate: { type: GraphQLString },
    completedAt: { type: GraphQLString },
    isArchived: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString }
  })
});

// -------------------- Input Type --------------------
const TaskInput = new GraphQLInputObjectType({
  name: 'TaskInput',
  fields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
    status: { type: GraphQLString },
    priority: { type: GraphQLString },
    assignedTo: { type: GraphQLString },
    project: { type: GraphQLString },
    tags: { type: new GraphQLList(GraphQLString) },
    dueDate: { type: GraphQLString },
    completedAt: { type: GraphQLString },
    isArchived: { type: GraphQLBoolean }
  }
});

// -------------------- Root Query --------------------
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    task: {
      type: TaskType,
      args: { id: { type: GraphQLID } },
      resolve: async (_, { id }) => await Task.findById(id)
    },
    tasks: {
      type: new GraphQLList(TaskType),
      args: {
        status: { type: GraphQLString },
        project: { type: GraphQLString },
        search: { type: GraphQLString },
        priority: { type: GraphQLString }
      },
      resolve: async (_, { status, project, search, priority }) => {
        const filter = {};
        if (status) filter.status = status;
        if (project) filter.project = project;
        if (priority) filter.priority = priority;
        if (search) {
          filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ];
        }
        return await Task.find(filter).sort({ createdAt: -1 });
      }
    }
  }
});

// -------------------- Mutations --------------------
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createTask: {
      type: TaskType,
      args: { input: { type: new GraphQLNonNull(TaskInput) } },
      resolve: async (_, { input }) => {
        const task = new Task({
          ...input,
          dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
          completedAt: input.completedAt ? new Date(input.completedAt) : undefined
        });
        return await task.save();
      }
    },

    updateTask: {
      type: TaskType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        input: { type: new GraphQLNonNull(TaskInput) }
      },
      resolve: async (_, { id, input }) => {
        return await Task.findByIdAndUpdate(
          id,
          { $set: input },
          { new: true, runValidators: true }
        );
      }
    },

    patchTaskStatus: {
      type: TaskType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        status: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (_, { id, status }) => {
        const valid = ['TODO','IN_PROGRESS','DONE'];
        if (!valid.includes(status)) throw new Error('Invalid status');
        const update = { status };
        if (status === 'DONE') update.completedAt = new Date();
        return await Task.findByIdAndUpdate(id, update, { new: true });
      }
    },

    deleteTask: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (_, { id }) => {
        const res = await Task.findByIdAndDelete(id);
        return !!res;
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
