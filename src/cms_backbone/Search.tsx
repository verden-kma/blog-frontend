import React from "react";
import {Link, RouteComponentProps, withRouter} from "react-router-dom";
import Form from "react-bootstrap/Form";
import {Button, FormControl} from "react-bootstrap";
import searchUser from "../assets/search-user.png"
import searchRecord from "../assets/search-record.png"
import "./local-styles.css"

type SearchMode = string
const searchModes: Array<SearchMode> = ["record", "publisher"];

interface ISearchData {
    query: string,
    mode: SearchMode
}

// <div>Icons made by <a href="https://www.flaticon.com/authors/payungkead" title="Payungkead">Payungkead</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
class Search extends React.Component<RouteComponentProps<any>, ISearchData> {
    constructor(props: RouteComponentProps<any>) {
        super(props);
        this.state = {
            query: "",
            mode: searchModes[0]
        }
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const {value, name} = event.target
        this.setState((oldState: ISearchData) => {
            return {...oldState, [name]: value}
        })
    }

// <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
    render() {
        return (
            <Form inline style={{flexWrap: "nowrap"}} onSubmit={event => event.preventDefault()}>
                <FormControl type={"text"}
                             name={"query"}
                             value={this.state.query}
                             onChange={this.handleChange}
                             className="mr-sm-2"/>

                <div className={"mx-1"}>
                    <label>
                        <FormControl type={"radio"}
                                     name={"mode"}
                                     value={searchModes[0]}
                                     checked={this.state.mode === searchModes[0]}
                                     onChange={this.handleChange}
                        />
                        <img src={searchRecord} alt={"Records"}/>
                    </label>
                    <label>
                        <FormControl type={"radio"}
                                     name={"mode"}
                                     value={searchModes[1]}
                                     checked={this.state.mode === searchModes[1]}
                                     onChange={this.handleChange}
                        />
                        <img src={searchUser} alt={"Publishers"}/>
                    </label>
                </div>

                <Link to={`/search/${this.state.mode}?query=${this.state.query}`} className={"mx-2"}>
                    <Button type={"submit"} variant={"light"} className={"btn-outline-dark"}>
                        Search
                    </Button>
                </Link>
            </Form>
        )
    }
}

export {searchModes};
export default withRouter(Search);