import { Router } from 'express';
import Config from './../config';
import Repository from '../lib/repository';
import UserRepository from '../lib/user_repository';
import User from '../lib/user';

const router = Router();

router.get('/:id/users/:user', async (req, res) => {
    const config = req.app.get('config') as Config;
    const repositories = await Repository.get(config);
    const repository = repositories.find(repository => repository.id === req.params.id);
    if (repository) {
        const users = await User.all(config);
        const user = users.find((user) => user.id === req.params.user);
        if (user) {
            const user_repository = await UserRepository.get(config, repository, user);
            return res.send(user_repository);
        }
    }
    return res.status(404).send();
});

router.get('/:id', async (req, res) => {
    const config = req.app.get('config') as Config;
    const repositories = await Repository.get(config);
    const repository = repositories.find(repository => repository.id === req.params.id);
    if (repository) {
        res.send({
            repository,
            users: await UserRepository.all(config, repository),
        });
    } else {
        res.status(404).send();
    }
});

router.get('/', async (req, res) => {
    const repositories = await Repository.get(req.app.get('config'));
    res.send(repositories);
});

export default router;

