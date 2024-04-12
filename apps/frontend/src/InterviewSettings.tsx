import { useState, FormEvent } from 'react';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import Button from '@mui/material/Button';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const questionCategories = [
    { label: 'Integrity', value: 'integrity' },
    { label: 'Professionalism', value: 'professionalism' },
    { label: 'Respect for diversity', value: 'respect for diversity' },
    { label: 'Communication', value: 'communication' },
    { label: 'Teamwork', value: 'teamwork' },
    { label: 'Planning and Organizing', value: 'planning and organizing' },
    { label: 'Accountability', value: 'accountability' },
    { label: 'Creativity', value: 'creativity' },
    { label: 'Client orientation', value: 'client orientation' },
    {
        label: 'Commitment to continuous learning',
        value: 'continuous learning',
    },
    { label: 'Technological awareness', value: 'technological awareness' },
    { label: 'Leadership', value: 'leadership' },
    { label: 'Vision', value: 'vision' },
    { label: 'Empowering Others', value: 'empowering others' },
    { label: 'Building Trust', value: 'building trust' },
    { label: 'Managing Performance', value: 'managing performance' },
    { label: 'Decision Making', value: 'decision making' },
];

export const InterviewSettings = ({
    categories,
    onCategoriesChange,
    onSubmit,
}: {
    visible?: boolean;
    categories: { label: string; value: string }[];
    onCategoriesChange: (
        categories: { label: string; value: string }[]
    ) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) => {
    const [optionsLimitReached, setOptionsLimitReached] =
        useState<boolean>(false);

    const [autocompleteOpen, setAutocompleteOpen] = useState<boolean>(false);

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
                {/* <div className="form-row">
                    <label htmlFor="questions-company">
                        What is the company you are applying for?{' '}
                        <small>(optional)</small>
                    </label>
                    <TextField
                        placeholder="Google"
                        size="small"
                        name="questions-company"
                    />
                </div>
                <div className="form-row">
                    <label htmlFor="questions-job">
                        The job you are applying for? <small>(optional)</small>
                    </label>
                    <TextField
                        placeholder="Software Engineer"
                        size="small"
                        name="questions-job"
                    />
                </div> */}
                <div className="form-row">
                    <label htmlFor="questions-categories">
                        Choose up to five categories: <small>(optional)</small>
                    </label>

                    <Autocomplete
                        multiple
                        size="small"
                        id="checkboxes-tags-demo"
                        options={questionCategories}
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
