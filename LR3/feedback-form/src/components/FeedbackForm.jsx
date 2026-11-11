import { useState } from "react";
import "./FeedbackForm.css";

function FeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [wantReply, setWantReply] = useState(false);

  const [errors, setErrors] = useState({
    name: null,
    email: null,
    phone: null,
    message: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    message: false,
  });

  const [submitted, setSubmitted] = useState(false);

  const validateName = (value) => {
    if (!value.trim()) return "Имя обязательно для заполнения";
    if (value.trim().length < 2) return "Минимум 2 символа";
    if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(value.trim())) return "Только буквы, пробелы и дефис";
    return null;
  };

  const validateEmail = (value) => {
    if (!value.trim()) {
      return wantReply ? "Email обязателен, так как вы хотите получить ответ" : null;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return "Некорректный формат email";
    }
    return null;
  };

  const validatePhone = (value) => {
    if (!value.trim()) return null;
    if (!/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(value)) {
      return "Введите номер полностью";
    }
    return null;
  };

  const validateMessage = (value) => {
    if (!value.trim()) return "Сообщение обязательно для заполнения";
    if (value.trim().length < 10) return "Минимум 10 символов";
    if (value.length > 500) return "Максимум 500 символов";
    return null;
  };

  const validators = {
    name: validateName,
    email: validateEmail,
    phone: validatePhone,
    message: validateMessage,
  };

  const formatPhoneNumber = (value) => {
    let digits = value.replace(/\D/g, "");
    if (!digits) return "";
    if (digits[0] !== "7") digits = "7" + digits;
    digits = digits.substring(0, 11);

    let formatted = "+7";
    if (digits.length > 1) formatted += " (" + digits.substring(1, 4);
    if (digits.length >= 4) formatted += ") " + digits.substring(4, 7);
    if (digits.length >= 7) formatted += "-" + digits.substring(7, 9);
    if (digits.length >= 9) formatted += "-" + digits.substring(9, 11);
    return formatted;
  };

  const handleChange = (field, value) => {
    let finalValue = value;
    if (field === "phone") {
      finalValue = formatPhoneNumber(value);
      setPhone(finalValue);
    } else if (field === "name") {
      setName(value);
    } else if (field === "email") {
      setEmail(value);
    } else if (field === "message") {
      setMessage(value);
    }

    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: validators[field](finalValue),
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setWantReply(isChecked);
    
    if (touched.email) {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(email),
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    const currentValue =
      field === "name" ? name :
      field === "email" ? email :
      field === "phone" ? phone : message;

    setErrors((prev) => ({
      ...prev,
      [field]: validators[field](currentValue),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {
      name: validateName(name),
      email: validateEmail(email),
      phone: validatePhone(phone),
      message: validateMessage(message),
    };

    setErrors(newErrors);
    setTouched({ name: true, email: true, phone: true, message: true });

    if (Object.values(newErrors).some((err) => err !== null)) {
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  const getInputClass = (field) => {
    const classes = ["field__input"];
    if (touched[field] && errors[field]) {
      classes.push("field__input--error");
    } else if (touched[field] && !errors[field] && (field !== 'email' || email)) { 
      classes.push("field__input--valid");
    }
    if (field === "message") {
      classes.push("field__input--textarea");
    }
    return classes.join(" ");
  };

  if (submitted) {
    return (
      <div className="feedback-form feedback-form--success">
        <h2 className="feedback-form__title">Спасибо за обращение!</h2>
        <p className="feedback-form__text">Мы свяжемся с вами в ближайшее время.</p>
        <button
          type="button"
          className="feedback-form__submit"
          onClick={() => {
            setName(""); setEmail(""); setPhone(""); setMessage(""); setWantReply(false);
            setErrors({ name: null, email: null, phone: null, message: null });
            setTouched({ name: false, email: false, phone: false, message: false });
            setSubmitted(false);
          }}
        >
          Отправить ещё одно сообщение
        </button>
      </div>
    );
  }

  return (
    <form className="feedback-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="name" className="field__label">Имя</label>
        <input
          id="name"
          type="text"
          className={getInputClass("name")}
          value={name}
          onChange={(e) => handleChange("name", e.target.value)}
          onBlur={() => handleBlur("name")}
        />
        {touched.name && errors.name && <span className="field__error">{errors.name}</span>}
      </div>

      <div className="field">
        <label htmlFor="email" className="field__label">
          Email {wantReply && <span style={{color: 'red'}}>*</span>}
        </label>
        <input
          id="email"
          type="email"
          className={getInputClass("email")}
          value={email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
        />
        {touched.email && errors.email && <span className="field__error">{errors.email}</span>}
      </div>

      <div className="field">
        <label htmlFor="phone" className="field__label">Телефон</label>
        <input
          id="phone"
          type="tel"
          className={getInputClass("phone")}
          value={phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          onBlur={() => handleBlur("phone")}
          placeholder="+7 (___) ___-__-__"
        />
        {touched.phone && errors.phone && <span className="field__error">{errors.phone}</span>}
      </div>

      <div className="field">
        <label htmlFor="message" className="field__label">Сообщение</label>
        <textarea
          id="message"
          className={getInputClass("message")}
          value={message}
          onChange={(e) => handleChange("message", e.target.value)}
          onBlur={() => handleBlur("message")}
          maxLength={500}
        />
        <div className="field__counter">
          {message.length} / 500
        </div>
        {touched.message && errors.message && <span className="field__error">{errors.message}</span>}
      </div>

      <div className="checkbox-group">
        <input 
          type="checkbox" 
          id="wantReply" 
          checked={wantReply} 
          onChange={handleCheckboxChange} 
        />
        <label htmlFor="wantReply">Хочу получить ответ (Email обязателен)</label>
      </div>

      <button type="submit" className="feedback-form__submit" disabled={isSubmitting}>
        {isSubmitting ? "Отправка..." : "Отправить"}
      </button>
    </form>
  );
}

export default FeedbackForm;