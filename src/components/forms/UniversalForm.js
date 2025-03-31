import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const Input = ({ type = 'text', value, onChange, className = '', error, ...props }) => (
    <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
      ${error ? 'border-red-500' : 'border-gray-300'} 
      ${className}`}
        {...props}
    />
);

const Textarea = ({ value, onChange, className = '', error, ...props }) => (
    <textarea
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
      ${error ? 'border-red-500' : 'border-gray-300'} 
      ${className}`}
        rows={4}
        {...props}
    />
);

const Checkbox = ({ checked, onChange, className = '', error, ...props }) => (
    <input
        type="checkbox"
        checked={checked ?? false}
        onChange={(e) => onChange?.(e.target.checked)}
        className={`w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition-all
      ${error ? 'border-red-500' : 'border-gray-300'} 
      ${className}`}
        {...props}
    />
);

const Select = ({ value, onChange, options = [], optionsLabel = 'label', className = '', error, placeholder = 'Выберите из списка...', ...props }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-3 py-2 border rounded-lg cursor-pointer flex items-center justify-between
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}`}
                {...props}
            >
        <span className={`${!value ? 'text-gray-500' : ''}`}>
          {value["id"] ? options.find(opt => opt.value === value)?[optionsLabel]:value[optionsLabel] : placeholder}
        </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                                onChange({ target: { value: option } });
                                setIsOpen(false);
                            }}
                        >
                            {option[optionsLabel]}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const Button = ({
                    children,
                    variant = 'primary',
                    type = 'button',
                    className = '',
                    ...props
                }) => {
    const variants = {
        primary: 'bg-blue-500 hover:bg-blue-600 text-white',
        outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700'
    };

    return (
        <button
            type={type}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200
        ${variants[variant]}
        ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

const UniversalForm = ({
                           initialData = {},
                           fields,
                           onSubmit,
                           onCancel,
                           isEdit = false
                       }) => {
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validate = () => {
        const newErrors = {};
        fields.forEach(field => {
            if (field.required && !formData[field.key]) {
                newErrors[field.key] = 'Это поле обязательно для заполнения';
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    const renderField = (field) => {
        const { key, label, type = 'text', options, optionsLabel } = field;
        const value = formData[key] || '';
        const error = errors[key];

        const fieldProps = {
            value,
            onChange: (e) => handleChange(key, e.target.value),
            error: !!error
        };

        if (type === 'checkbox') {
            return (
                <div key={key} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <Checkbox
                        checked={!!formData[key]}
                        onChange={(checked) => handleChange(key, checked)}
                        error={!!error}
                    />
                    {error && (
                        <p className="mt-1 text-sm text-red-500">{error}</p>
                    )}
                </div>
            );
        }

        return (
            <div key={key} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {type === 'textarea' && (
                    <Textarea {...fieldProps} />
                )}

                {type === 'select' && (
                    <Select {...fieldProps} options={options} optionsLabel={optionsLabel} />
                )}

                {(type === 'text' || type === 'date') && (
                    <Input {...fieldProps} type={type} />
                )}

                {type === 'number' && (
                    <Input {...fieldProps} type={type} />
                )}

                {type === 'file' && (
                    <Input
                        type="file"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            console.log('Selected file:', file);
                            handleChange(key, file);
                        }}
                        accept={field.accept}
                        error={!!error}
                    />
                )}

                {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                )}
            </div>
        );
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md">
            <div className="p-6">
                <form onSubmit={handleSubmit}>
                    {fields.map(renderField)}

                    <div className="flex justify-end gap-4 mt-6">
                        <Button
                            variant="outline"
                            onClick={onCancel}
                        >
                            Отменить
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                        >
                            {isEdit ? 'Сохранить' : 'Создать'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UniversalForm;