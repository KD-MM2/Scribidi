import type { FormProps } from "antd";
import { Button, Card, Form, Input } from "antd";

import React from "react";

import { authProvider } from "@/lib/router";
import { LoginInfo } from "@/types/schemas";

const onFinish: FormProps<LoginInfo>["onFinish"] = (values) => {

	console.log("Success:", values);
	authProvider
		.signin(values.email, values.password)
		.then((user) => {
			console.log("User:", user);
			console.log("onFinish: FormProps<LoginInfo>['onFinish']: Redirecting to /");
			window.location.href = "/";
		})
		.catch((error) => {
			console.error("Error:", error);
		});
};

const onFinishFailed: FormProps<LoginInfo>["onFinishFailed"] = (errorInfo) => {
	console.log("Failed:", errorInfo);
};

const Login: React.FC = () => (
	<Card
		style={{
			width: 400,
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
		}}
	>
		<Form
			name="basic"
			labelCol={{ span: 6 }}
			wrapperCol={{ span: 30 }}
			style={{ maxWidth: 600 }}
			// initialValues={{ remember: true }}
			onFinish={onFinish}
			onFinishFailed={onFinishFailed}
			autoComplete="off"
		>
			<Form.Item<LoginInfo>
				label="Email"
				name="email"
				rules={[
					{
						type: "email",
						required: true,
						message: "Please input your email!",
					},
				]}
			>
				<Input />
			</Form.Item>

			<Form.Item<LoginInfo>
				label="Password"
				name="password"
				rules={[
					{ required: true, message: "Please input your password!" },
				]}
			>
				<Input.Password />
			</Form.Item>

			<Form.Item label={null}>
				<Button type="primary" htmlType="submit">
					Submit
				</Button>
			</Form.Item>
		</Form>
	</Card>
);

export { Login };
