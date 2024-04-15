import { useState, FormEvent, useEffect } from 'react';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import Button from '@mui/material/Button';
import type { QuestionsCategories } from '@behavioral-interview/types';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export const InterviewSettings = ({
    categories,
    onCategoriesChange,
    onSubmit,
}: {
    visible?: boolean;
    categories: QuestionsCategories[];
    onCategoriesChange: (categories: QuestionsCategories[]) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) => {
    const [optionsLimitReached, setOptionsLimitReached] =
        useState<boolean>(false);

    const [autocompleteOpen, setAutocompleteOpen] = useState<boolean>(false);
    const [options, setOptions] = useState<QuestionsCategories[]>([]);

    const getOptions = async () => {
        try {
            const response = await fetch(
                // @ts-ignore: Unreachable code error
                `${__REACT_APP_API_URL__}/questions-categories`
            );
            const json = await response.json();
            setOptions(json);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getOptions();
    }, []);

    return (
        <form
            id="interview-settings"
            onSubmit={onSubmit}
            style={{ textAlign: 'center' }}
        >
            <Typography variant="h3" component="h2" marginBottom={5}>
                Behavioral Interview
            </Typography>

            <Typography variant="h5">
                Practice behavioral interviews and get feedback on your answers
            </Typography>
            <div className="fields" style={{ marginTop: '20px' }}>
                <div className="form-row">
                    <label htmlFor="questions-categories">
                        Choose up to five categories: <small>(optional)</small>
                    </label>

                    <Autocomplete
                        multiple
                        size="small"
                        id="checkboxes-tags-demo"
                        options={options}
                        disableCloseOnSelect
                        open={autocompleteOpen}
                        onOpen={() => setAutocompleteOpen(true)}
                        onClose={() => setAutocompleteOpen(false)}
                        getOptionLabel={(option) => option.label}
                        getOptionDisabled={() => optionsLimitReached}
                        renderOption={(props, option, { selected }) => (
                            <li {...props}>
                                <Checkbox
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{ marginRight: 8 }}
                                    checked={selected}
                                />
                                {option.label}
                            </li>
                        )}
                        style={{ width: 400 }}
                        value={categories}
                        onChange={(e, value) => {
                            onCategoriesChange(value);
                            setOptionsLimitReached(value.length >= 5);
                            if (value.length >= 5) {
                                setAutocompleteOpen(false);
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                placeholder="Teamwork, Communication, ..."
                                {...params}
                            />
                        )}
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="btn"
                variant="contained"
                style={{ marginTop: '40px' }}
            >
                Start Interview
            </Button>
        </form>
    );
};
