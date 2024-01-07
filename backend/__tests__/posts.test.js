const comparePosts = (post1, post2) => {
    expect(post1._id).toEqual(post2._id);
    expect(post1.title).toEqual(post2.title);
    expect(post1.summary).toEqual(post2.summary);
    expect(post1.author).toEqual(post2.author);
    expect(post1.tags).toEqual(post2.tags);
    expect(post1.wordCount).toEqual(post2.wordCount);
    expect(post1.readingTime).toEqual(math.round((post2.wordCount / 200)*60));
    expect(post1.likes).toBeDefined();
    expect(post1.views).toBeDefined();
    expect(post1.datePosted).toBeDefined();
    
    post1.body.forEach((item, index) => {
        expect(item.type).toEqual(post2.body[index].type);
        expect(item.content).toEqual(post2.body[index].content);
        expect(item.order).toEqual(post2.body[index].order);
        if(item.type == 'Text') {
            expect(item.HTMLContent).toBeDefined();
        }
    });
}

describe('Post API', () => {
    let postId;
    const newPost = {
        title: 'Exploring the Depths of Machine Learning',
        summary: 'An in-depth look at the latest trends and techniques in the field of machine learning.',
        author: 'Jane Doe',
        topic: 'Machine Learning',
        body: [
            { 
                type: 'Text', 
                content: `## Machine Learning: A Rapidly Evolving Field
    
                        Machine learning is a rapidly evolving field. With the advent of new technologies and techniques, we are able to create more sophisticated models than ever before. Here are some key points:
                        
                        - Machine learning models can learn from data and improve over time.
                        - They are used in a variety of applications, from recommendation systems to autonomous vehicles.
                        
                        Here is a code snippet in Python:
                        
                        \`\`\`python
                        from sklearn.ensemble import RandomForestClassifier
                        clf = RandomForestClassifier(random_state=0)
                        X = [[ 1,  2,  3],  # 2 samples, 3 features
                            [11, 12, 13]]
                        y = [0, 1]  # classes of each sample
                        clf.fit(X, y)
                        \`\`\`
                        `,
                order: 1 
            },
            { 
                type: 'Text', 
                content: `### Exciting Developments
    
                        One of the most exciting developments is the use of deep learning. Deep learning models are capable of learning from large amounts of data and can achieve impressive results in tasks such as image recognition and natural language processing.
                        
                        ![Neural Network](neural-network.png)
                        
                        Deep learning is a subset of machine learning where artificial neural networks, algorithms inspired by the human brain, learn from large amounts of data. While a neural network with a single layer can still make approximate predictions, additional hidden layers can help optimize the results.
                        
                        1. **Convolutional Neural Networks (CNNs)**: CNNs are used primarily for image processing, named for their mathematical operation called convolution integral.
                        2. **Recurrent Neural Networks (RNNs)**: RNNs are used primarily for speech recognition and natural language processing (NLP).
                        3. **Generative Adversarial Networks (GANs)**: GANs are actually two networks, one that generates a "fake" version of an image, and one that tries to guess whether the image is the original or the "fake" version.
                        
                        Deep learning drives many artificial intelligence (AI) applications and services that improve automation, performing tasks commonly associated with human intelligence, like recognizing speech, images, and patterns, and making predictions based on large datasets.
                        `,
                order: 2 
            },
            { 
                type: 'Images', 
                content: ['ml-trends.jpg', 'neural-network.png'], 
                order: 3 
            }
        ],
        tags: ['Machine Learning', 'AI', 'Deep Learning'],
    };

    newPost.wordCount = newPost.body.reduce((count, element) => {
        if (element.type == 'Text') {
            return count + element.content.match(/(\w+)/g).length;
        } else {
            return count;
        }
    }, 0);

    it('should create a new post', async () => {
        const response = await global.request
            .post('/post')
            .send(newPost);
        postId = response.body.post._id;
        comparePosts(response.body.post, newPost);
    });

    it('should get post by ID', async () => {
        const response = await global.request
            .get(`/post/${postId}`);
        comparePosts(response.body.post, newPost);
    });

    it('should get all posts', async () => {
        const response = await global.request
            .get('/post');
        expect(response.body.posts.length).toBeGreaterThan(0);
    });

    it('should update a post', async () => {
        const updatedPost = {
            title: 'Exploring the Depths of Machine Learning',
            summary: 'An in-depth look at the latest trends and techniques in the field of machine learning.',
        }
        const response = await global.request
            .put(`/post/${postId}`)
            .send(updatedPost);

        comparePosts(response.body.post, { ...newPost, ...updatedPost });
    });

    it('should get all posts by author', async () => {
        const response = await global.request
            .get(`/post/author/${newPost.author}`);
        expect(response.body.posts.length).toBeGreaterThan(0);
    });

    it('should get all posts by topic', async () => {
        const response = await global.request
            .get(`/post/topic/${newPost.topic}`);
        expect(response.body.posts.length).toBeGreaterThan(0);
    });

    it('should get all posts by tag', async () => {
        const response = await global.request
            .get(`/post/tag/${newPost.tags[0]}`);
        expect(response.body.posts.length).toBeGreaterThan(0);
    });

    it('should delete a post', async () => {
        const response = await global.request
            .delete(`/post/${postId}`);
        expect(response.body.post._id).toEqual(postId);
    });

    it('should not get a deleted post', async () => {
        const response = await global.request
            .get(`/post/${postId}`);
        
        expect(response.statusCode).toBe(404);
    });
});