exports.getPost = (req, res) => {
    try {
        const id = req.params.id;
        const placeholderText = `Placeholder for getting a post by id:${id}`;

        res.status(200).json({message: placeholderText });
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal Server Error"})
    }
}

exports.getPosts = (req, res) => {
    try {
        const type = req.query.type;
        const count = req.query.count;
        const page = req.query.page;
        const topic = req.query.topic;
        const sort = req.query.sort;
        const order = req.query.order;

        const placeholderText = `This is a placeholder response for getting posts by type:${type}, count:${count}, page:${page}, topic:${topic}, sort:${sort}, order:${order}`;

        res.status(200).json({message: placeholderText});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

