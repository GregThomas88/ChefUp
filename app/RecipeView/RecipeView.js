import React from 'react';
import { AppRegistry, StyleSheet, Text, View, ScrollView, Alert, Button, Image, Picker, Dimensions } from 'react-native';


export default class RecipeView extends React.Component {

    constructor(props) {
        super(props);

        // Get ID passed from RecipeMain. If not found use default value "NO-ID"
        this.id = this.props.navigation.getParam('recipeId', 'NO-ID');

        this.servingN = [1, 2, 3, 4, 5];

        this.state = {
            data: [],
            ingredients: [],
            tools: [],
            extra: false,
            stepTime: 10,
            timerDisabled: false,
            servingSize: 1
        };

        this.renderData = this.renderData.bind(this);

    }

    componentDidMount() {

        this.fetchData();

    }

    fetchData() {

        // POST request for current recipeId's info
        fetch('http://blue.cs.sonoma.edu:8142/recipeById', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: this.id
            }),
        })
            .then((response) => response.json())
            .then((response) => {
                this.setState({
                    data: [...response],
                    ingredients: [...response][0].total_ingredients.split(', '),
                    tools: [...response][0].tools.split(', ')
                });
            })
            .then( this.fetchIngredients() )
            .catch((error) => {
            console.log('error in first');
            console.log(error);
                Alert.alert(
                    'Database Connection Error',
                    'fetch request failed',
                    [
                        {text: 'OK', onPress: () => this.props.navigation.pop() }
                    ]
                )
            });

    }

    // Only for foods with extra info
    fetchIngredients() {
        // POST request for current recipeId's info
        fetch('http://blue.cs.sonoma.edu:8142/ingredientsById', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: this.id
            }),
        })
            .then((response) => response.json())
            .then((response) => {
                // If the ingredients table has an entry for this recipe, use it's additional ingredients info instead
                if(response.length > 0) {
                    this.setState({
                        ingredients: [...response],
                        extra: true
                    });
                }
            })
            .catch((error) => {
                console.log('error in second');
                console.log(error);
                Alert.alert(
                    'Database Connection Error',
                    'fetch request failed',
                    [
                        {text: 'OK', onPress: () => this.props.navigation.pop() }
                    ]
                )
            });
    }


    renderData(data, idx) {

        const { id, Rname, category, total_ingredients, difficulty, tools, info, Rtime} = data;

        return (
            <View key={idx} style={styles.container}>
                <Text style={styles.title}> {Rname}</Text>

                <Image
                    style={{
                        resizeMode: 'contain',
                        width: 300,
                        height: 300
                    }}
                    source={{uri: 'https://media.asicdn.com/images/jpgo/25390000/25391162.jpg'}}
                />

                <Text style={styles.desctext}>{info}</Text>
                <Text style={styles.space}> </Text>
                <Text style={styles.titletext}>Total Ingredients: </Text>
                {
                    // should probably use item.food !== undefined instead of this.state.extra. This causes weird results sometimes
                    this.state.ingredients.map( (item, idx) => {
                        return (<Text key={idx} style={styles.text}>{ item.food !== undefined ? item.food + ': ' + parseFloat(item.size)*this.state.servingSize + ' ' + item.unit : item}</Text>);
                    })
                }
                <Text style={styles.space}> </Text>
                <Text style={styles.titletext}>Tools: </Text>
                {
                    this.state.tools.map( (item, idx) => {
                        return (<Text key={idx} style={styles.text}>{item}</Text>);
                    })
                }
                <Text style={styles.space}> </Text>
                <Text style={styles.text}>Difficulty: {difficulty} </Text>
                <Text style={styles.space}> </Text>
                <Text style={styles.text}>Total Time: {Rtime} m</Text>
            </View>
        )
    }

    timerCountdown() {
        let newTime = this.state.stepTime -1;

        if( newTime === 0) {
            clearInterval(this.state.timerId);
            Alert.alert(
                'Timer Done',
                '',
                [
                    {text: 'OK'}
                ]
            )
        }
        this.setState({ stepTime: newTime });
    }



    render() {

        let screenWidth = Dimensions.get('window').width;
        let screenHeight = Dimensions.get('window').height;

        return (
            <View style={styles.container}>

                <ScrollView
                    style={{position: 'absolute', top: 0, bottom: 100}}
                >

                    {
                        this.state.data.map( (item, idx) => {
                            return this.renderData(item, idx);
                        })
                    }

                    <Text>Time Left: {this.state.stepTime}</Text>
                    <Button
                        title="Start Timer"
                        color='darksalmon'
                        disabled={this.state.timerDisabled}
                        onPress={() => {
                            if( this.state.stepTime > 0 ) {
                                let timerId = setInterval(this.timerCountdown.bind(this), 1000);
                                this.setState({timerId: timerId, timerDisabled: true});
                            }
                        }}

                    />


                    <Button
                        title="Show Steps"
                        color='darksalmon'
                        onPress={() => this.props.navigation.push('Steps', {
                            recipeId: this.id
                        })}

                    />
                </ScrollView>


                <Picker
                    selectedValue={this.state.servingSize}
                    style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, backgroundColor: '#fff'}}
                    onValueChange={(itemValue, itemIndex) =>
                        this.setState({servingSize: itemValue})
                    }>
                    {
                        this.servingN.map( (item, idx) => (<Picker.Item key={idx} label={item.toString()} value={item} />))

                    }
                </Picker>

                {/* Declated after Picker because we want to render this last (and on top of) the picker background */}
                <Text style={{position: 'relative', top: screenHeight/2 - 125, left: 0, right: 0, alignItems: 'baseline'}}>Serving Size:</Text>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'tomato',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    title: {
        flex: 1,
        fontSize: 25,
        alignItems: 'center',
        fontWeight: 'bold',
        color: 'firebrick',
    },
    titletext: {
        fontSize: 22,
        margin: 2,
        color: 'papayawhip',
    },
    text: {
        fontSize: 20,
        margin: 2,
        color: 'moccasin',
    },
    desctext: {
        fontSize: 15,
        margin: 2,
        color: 'moccasin',
    },
    space: {
        textAlign:'center',
        margin: .5
    }
});

AppRegistry.registerComponent('RecipeView', () => RecipeView);